import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
            include: {
                bed: true
            },
            orderBy: {
                bed: {
                    label: 'asc'
                }
            }
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// Get single patient with history
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                bed: true,
                medicalHistory: {
                    orderBy: { uploadedAt: 'desc' }
                }
            }
        });

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});


export default router;
