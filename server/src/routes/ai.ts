import { Router } from 'express';
import { chatWithPatient, generateHandoverReport } from '../services/aiService';

const router = Router();

// Chat Endpoint
router.post('/chat', async (req, res) => {
    const { patientId, message } = req.body;
    if (!patientId || !message) {
        return res.status(400).json({ error: 'Missing patientId or message' });
    }

    try {
        const response = await chatWithPatient(patientId, message);
        res.json({ response });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

// Handover Endpoint
router.post('/handover', async (req, res) => {
    const { patientId, vitals } = req.body;
    if (!patientId || !vitals) {
        return res.status(400).json({ error: 'Missing patientId or vitals' });
    }

    try {
        const report = await generateHandoverReport(patientId, vitals);
        res.json({ report });
    } catch (error) {
        console.error("Handover Error:", error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

export default router;
