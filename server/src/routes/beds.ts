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

export default router;
