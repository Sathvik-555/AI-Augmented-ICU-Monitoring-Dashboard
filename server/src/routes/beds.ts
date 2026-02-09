import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all beds (including VACANT)
router.get('/', async (req, res) => {
    try {
        const beds = await prisma.bed.findMany({
            orderBy: { label: 'asc' },
            include: {
                patient: true
            }
        });
        res.json(beds);
    } catch (error) {
        console.error("Error fetching beds:", error);
        res.status(500).json({ error: "Failed to fetch beds" });
    }
});

// Admit Patient
router.post('/:bedId/admit', async (req, res) => {
    const { bedId } = req.params;
    const { name, age, gender, condition } = req.body;

    try {
        // Create Patient
        const newPatient = await prisma.patient.create({
            data: {
                name,
                age: Number(age),
                gender,
                condition,
                status: 'ADMITTED',
                bed: {
                    connect: { id: bedId }
                }
            }
        });

        // Update Bed Status
        await prisma.bed.update({
            where: { id: bedId },
            data: { status: 'OCCUPIED' }
        });

        res.json(newPatient);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Admit failed" });
    }
});

// Discharge Patient
router.post('/:bedId/discharge', async (req, res) => {
    const { bedId } = req.params;

    try {
        // Find current patient in this bed
        const bed = await prisma.bed.findUnique({
            where: { id: bedId },
            include: { patient: true }
        });

        if (!bed || !bed.patientId) {
            return res.status(400).json({ error: "Bed is already vacant" });
        }

        // Update Patient Status
        await prisma.patient.update({
            where: { id: bed.patientId },
            data: { status: 'DISCHARGED' }
        });

        // Update Bed (Disconnect patient)
        const updatedBed = await prisma.bed.update({
            where: { id: bedId },
            data: {
                status: 'VACANT',
                patient: { disconnect: true }
            }
        });

        res.json(updatedBed);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Discharge failed" });
    }
});

// Move Patient to Another Bed
router.post('/:bedId/move', async (req, res) => {
    const { bedId } = req.params;
    const { targetBedId } = req.body;

    if (!targetBedId) return res.status(400).json({ error: "Missing targetBedId" });

    try {
        // 1. Get Source Bed (must be occupied)
        const sourceBed = await prisma.bed.findUnique({
            where: { id: bedId },
            include: { patient: true }
        });
        if (!sourceBed?.patientId) return res.status(400).json({ error: "Source bed is empty" });

        // 2. Get Target Bed (must be vacant)
        const targetBed = await prisma.bed.findUnique({ where: { id: targetBedId } });
        if (targetBed?.status === 'OCCUPIED' || targetBed?.patientId) {
            return res.status(400).json({ error: "Target bed is occupied" });
        }

        // 3. Perform Move in Transaction
        await prisma.$transaction([
            // Update Patient record to point to new bed
            prisma.patient.update({
                where: { id: sourceBed.patientId },
                data: {
                    bed: { connect: { id: targetBedId } }
                }
            }),
            // Set Source Bed to Vacant & Disconnect Patient
            prisma.bed.update({
                where: { id: bedId },
                data: {
                    status: 'VACANT',
                    patient: { disconnect: true }
                }
            }),
            // Set Target Bed to Occupied
            prisma.bed.update({
                where: { id: targetBedId },
                data: { status: 'OCCUPIED' } // Patient connection happens via patient update above? Or need to explicitly connect here?
                // Actually prisma handle one side is enough usually, but to be safe let's ensure status is updated.
                // The patient update connects the relation, which should update the bed's patientId.
                // But we must update the status field manually if it's not computed.
            })
        ]);

        res.json({ success: true, message: `Moved patient to bed ${targetBedId}` });

    } catch (error) {
        console.error("Move failed:", error);
        res.status(500).json({ error: "Move failed" });
    }
});

export default router;
