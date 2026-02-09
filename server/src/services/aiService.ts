import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'llama3.2:1b';

// Helper to call Ollama
export async function callOllama(prompt: string, system: string): Promise<string> {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt,
                system,
                stream: false
            })
        });

        if (!response.ok) throw new Error('Ollama API failed');
        const data = await response.json();
        return data.response;
    } catch (e) {
        console.error("AI Service Error:", e);
        return "AI Analysis Unavailable";
    }
}

export async function generateSummary(text: string): Promise<string> {
    const systemPrompt = "You are an expert medical assistant. Summarize the following medical record into key clinical points (Past History, Medications, Allergies, Recent Events). Keep it concise.";
    const userPrompt = `Summarize this text:\n\n${text.substring(0, 10000)}`; // Truncate to avoid context limit

    return await callOllama(userPrompt, systemPrompt);
}

export async function predictWithHistory(patientId: string, vitals: any) {
    // 1. Fetch Patient Context
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { patientContextSummary: true, condition: true }
    });

    const specificHistory = patient?.patientContextSummary || "No history available.";
    const initialCondition = patient?.condition || "Unknown";

    // 2. Construct Prompt
    const systemPrompt = `You are an expert ICU Intensivist. Analyze the data.`;
    const userPrompt = `
    PATIENT CONTEXT:
    Condition: ${initialCondition}
    Medical History Summary:
    ${specificHistory}

    CURRENT VITALS:
    HR: ${vitals.hr}
    BP: ${vitals.sbp}/${vitals.dbp}
    SpO2: ${vitals.spo2}
    RR: ${vitals.rr}
    Temp: ${vitals.temp}

    TASK:
    Analyze the priority (1-4). Explain reasoning referencing the history if relevant.
    Return JSON: { priority: number, reason: string, suggestion: string }
    `;

    // 3. Call AI
    const rawResponse = await callOllama(userPrompt, systemPrompt);

    // Parse JSON (Simple)
    try {
        // Extract JSON block
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
        return JSON.parse(jsonStr);
    } catch (e) {
        return { priority: 4, reason: rawResponse, suggestion: "Monitor manually" };
    }
}

export async function chatWithPatient(patientId: string, message: string): Promise<string> {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { patientContextSummary: true, name: true, condition: true, gender: true, age: true }
    });

    if (!patient) return "Error: Patient not found.";

    const context = patient.patientContextSummary || "No detailed history available.";

    const systemPrompt = `You are a helpful medical assistant for patient ${patient.name} (${patient.age}, ${patient.gender}). 
    Condition: ${patient.condition}.
    Medical History: ${context}
    
    Answer the doctor's question accurately based on the history. If unknown, say so. Keep answers professional and clinical.
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    - Use Markdown for all lists and headers.
    - Use **bold** for key terms.
    - Use dashed lists (-) for points.
    - Do not output a single long paragraph. Break it down.`;

    const userPrompt = message;

    return await callOllama(userPrompt, systemPrompt);
}

export async function generateHandoverReport(patientId: string, vitals: any): Promise<string> {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { patientContextSummary: true, name: true, condition: true, gender: true, age: true, bed: true }
    });

    if (!patient) return "Error: Patient not found.";

    const context = patient.patientContextSummary || "No history.";

    const systemPrompt = `You are a senior nurse writing a shift handover report.`;

    const userPrompt = `
    Generate a formal SBAR (Situation, Background, Assessment, Recommendation) handover report.
    
    PATIENT: ${patient.name} (${patient.age}y ${patient.gender})
    BED: ${patient.bed?.label || 'Unassigned'}
    CONDITION: ${patient.condition}
    
    CURRENT VITALS:
    HR: ${vitals.hr}
    BP: ${vitals.sbp}/${vitals.dbp}
    SpO2: ${vitals.spo2}%
    RR: ${vitals.rr}
    Temp: ${vitals.temp}C
    
    BACKGROUND/HISTORY:
    ${context}
    
    INSTRUCTIONS:
    - Format as Markdown.
    - Be concise.
    - Highlight abnormalities.
    `;

    return await callOllama(userPrompt, systemPrompt);
}
