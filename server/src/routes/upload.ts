import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
const PDFParser = require("pdf2json");
// import fs from 'fs'; // No longer needed for buffer reading if we use loadPDF, but let's keep imports clean

import { generateSummary } from '../services/aiService';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Helper for pdf2json
function parsePDF(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
        });
        pdfParser.loadPDF(filePath);
    });
}

router.post('/:patientId/history', upload.single('file'), async (req, res) => {
    const patientId = req.params.patientId as string;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Use new parser
        const extractedText = await parsePDF(file.path);

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
