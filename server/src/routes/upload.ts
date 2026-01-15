import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
const pdfParse = require('pdf-parse');
import fs from 'fs';
import path from 'path';

import { generateSummary } from '../services/aiService';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.post('/:patientId/history', upload.single('file'), async (req, res) => {
    const patientId = req.params.patientId as string;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        const extractedText = data.text;

        // Generate Summary
        const summary = await generateSummary(extractedText);

        // Save to DB
        const record = await prisma.medicalRecord.create({
            data: {
                patientId,
                fileName: file.originalname,
                fileUrl: file.path,
                extractedText,
                summary,
                modelUsed: 'llama3.2:1b', // Default for now
                summaryVersion: '1.0'
            }
        });

        // Update Patient Context Cache (Concatenate all summaries)
        const allHistory = await prisma.medicalRecord.findMany({
            where: { patientId },
            select: { summary: true }
        });
        const combinedSummary = allHistory.map(h => h.summary).join('\n---\n');

        await prisma.patient.update({
            where: { id: patientId },
            data: { patientContextSummary: combinedSummary }
        });

        res.json(record);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});

export default router;
