import { VitalSigns } from './simulator';
import { predictPriority } from './ml-service';

export type PriorityLevel = 1 | 2 | 3 | 4;

export type AIAnalysis = {
    priority: PriorityLevel;
    summary: string;
    reasoning: string;
    suggested_action: string;
    timestamp: number;
    source: string;
};

export interface AIConfig {
    ollamaUrl: string;
    modelName: string;
}

const DEFAULT_URL = '/api/ollama/generate';
const DEFAULT_MODEL = 'llama3.2:1b';

const SYSTEM_PROMPT = `
You are an expert ICU Intensivist.
The patient's vital signs have been analyzed and assigned a Priority Level based on clinical rules.
Your task is to generate a clinical summary and reasoning that explains WHY this priority was assigned.

Input Data:
- Vitals: HR, SBP, SpO2, etc.
- Assigned Priority: 1 (Critical), 2 (Urgent), 3 (Warning), or 4 (Normal).

Output Format: JSON ONLY.
{
  "summary": "<Short clinical summary>",
  "reasoning": "<Explain the priority based on the abnormal vitals>",
  "suggested_action": "<Clinical recommendation>"
}
`;

export function calculatePriority(vitals: VitalSigns): { priority: PriorityLevel; reason: string } {
    if (vitals.hr < 40 || (vitals.sbp < 90 && (vitals.hr > 100 || vitals.hr < 50)) || vitals.spo2 < 85 || vitals.rr > 30) {
        return { priority: 1, reason: "Critical instability (Severe bradycardia, Hemodynamic shock, Hypoxia<85, or RR>30)" };
    }
    if (vitals.sbp < 100 || (vitals.spo2 >= 85 && vitals.spo2 < 90) || vitals.hr > 120 || (vitals.temp > 39 && vitals.hr > 100)) {
        return { priority: 2, reason: "Urgent deterioration (Hypotension, Hypoxia 85-90, Tachycardia >120, or Sepsis)" };
    }
    if ((vitals.hr > 100 && vitals.hr <= 120) || vitals.sbp > 160 || (vitals.spo2 >= 90 && vitals.spo2 < 94)) {
        return { priority: 3, reason: "Warning signs (Mild Tachycardia, Hypertension, or SpO2 90-94)" };
    }
    return { priority: 4, reason: "Vitals within normal limits" };
}


// Retaining existing code but acknowledging update needed.
// Only modifying analyzeVitals to be ready for backend switch if needed.
// For now, I will keep it as is since SinglePatientView uses it.
// I will implement backend integration for analyzeVitals in next step to be cleaner.
export async function analyzeVitals(vitals: VitalSigns, config?: AIConfig): Promise<AIAnalysis> {
    // 1. AI/ML Priority Prediction
    const { priority, confidence } = await predictPriority(vitals);

    // Config defaults
    const ollamaUrl = config?.ollamaUrl || DEFAULT_URL;
    const modelName = config?.modelName || DEFAULT_MODEL;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const promptText = `
Patient Vitals:
- Heart Rate: ${vitals.hr} bpm
- Systolic BP: ${vitals.sbp} mmHg
- Diastolic BP: ${vitals.dbp} mmHg
- SpO2: ${vitals.spo2} %
- Respiratory Rate: ${vitals.rr} /min
- Temperature: ${vitals.temp} C

ASSIGNED PRIORITY: ${priority}
AI CONFIDENCE: ${(confidence * 100).toFixed(1)}%
`;

        console.log(`[AI Service] Sending request to ${ollamaUrl} (Model: ${modelName})...`);

        const response = await fetch(ollamaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelName,
                system: SYSTEM_PROMPT,
                prompt: promptText,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log("[AI Service] Response received:", data);
        console.log("[AI Service] Response.response value:", data.response);

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = data.response;

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Try to find JSON object in the text
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        console.log("[AI Service] Extracted JSON:", jsonText);
        const result = JSON.parse(jsonText);

        return {
            priority: priority, // Enforce the calculated priority
            summary: result.summary,
            reasoning: result.reasoning,
            suggested_action: result.suggested_action,
            timestamp: Date.now(),
            source: `Ollama (${modelName})`
        };

    } catch (error) {
        console.error("[AI Service] Analysis failed:", error);

        // Use ML priority but fallback text if Ollama fails
        let summary = "Patient is stable.";
        let reasoning = "Vitals within normal limits (ML Prediction).";
        let action = "Continue monitoring.";

        if (priority === 1) {
            summary = "Critical Instability Detected";
            reasoning = "ML Model detected critical pattern.";
            action = "Activate Rapid Response Team immediately.";
        } else if (priority === 2) {
            summary = "Urgent Clinical Deterioration";
            reasoning = "ML Model detected urgent deterioration.";
            action = "Assess airway, breathing, circulation.";
        } else if (priority === 3) {
            summary = "Abnormal Vitals - Warning";
            reasoning = "ML Model detected warning signs.";
            action = "Increase monitoring frequency.";
        }

        return {
            priority,
            summary,
            reasoning,
            suggested_action: action,
            timestamp: Date.now(),
            source: 'TensorFlow.js (Ollama Offline)'
        };
    }
}

export function runFallbackAnalysis(vitals: VitalSigns): AIAnalysis {
    const { priority, reason } = calculatePriority(vitals);

    let summary = "Patient is stable.";
    let action = "Continue monitoring.";

    if (priority === 1) {
        summary = "Critical Instability Detected";
        action = "Activate Rapid Response Team immediately.";
    } else if (priority === 2) {
        summary = "Urgent Clinical Deterioration";
        action = "Assess airway, breathing, circulation. Consider fluid bolus or O2 therapy.";
    } else if (priority === 3) {
        summary = "Abnormal Vitals - Warning";
        action = "Increase monitoring frequency. Check patient comfort/pain.";
    }

    return {
        priority,
        summary,
        reasoning: reason,
        suggested_action: action,
        timestamp: Date.now(),
        source: 'Fallback (Rule Engine)'
    };
}
