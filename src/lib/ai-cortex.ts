import { VitalSigns } from './simulator';

export type PriorityLevel = 1 | 2 | 3 | 4;

export type AIAnalysis = {
    priority: PriorityLevel;
    summary: string;
    reasoning: string;
    suggested_action: string;
    timestamp: number;
    source: string;
};

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'llama3.2:1b'; // Configurable

const SYSTEM_PROMPT = `
You are an expert ICU Intensivist. Analyze the following patient vital signs.
Output ONLY a JSON object with the following keys: "priority" (integer 1-4), "summary" (string), "reasoning" (string), "suggested_action" (string).

DECISION MATRIX:
Priority 1 (CRITICAL): Immediate life threat.
- Cardiac Arrest / Severe Bradycardia (HR < 40)
- Severe Shock (SBP < 90 AND HR > 100)
- Severe Hypoxia (SpO2 < 85)
- Extreme Tachypnea (RR > 30)

Priority 2 (URGENT): Rapid deterioration risk.
- Hypotension (SBP < 100)
- Hypoxia (SpO2 85-90)
- Tachycardia (HR > 120)
- High Fever (>39C) with Tachycardia

Priority 3 (WARNING): Abnormal but stable.
- Mild Tachycardia (100-120)
- Hypertension (SBP > 160)
- Low Grade Fever
- SpO2 90-94

Priority 4 (NORMAL):
- All vitals within normal range.

Do not include markdown formatting like \`\`\`json. Just the raw JSON.
`;

import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;
let isModelLoading = false;

// Load model on module import (or first use)
async function loadModel() {
    if (model || isModelLoading) return;
    isModelLoading = true;
    try {
        console.log("[AI Cortex] Loading model weights...");
        const response = await fetch('/models/vital-monitor/manual_weights.json');
        if (!response.ok) throw new Error("Failed to fetch weights");

        const weightsData = await response.json();

        // Reconstruct model architecture (must match Python script)
        const newModel = tf.sequential();

        // Layer 1: Dense 16, ReLU, Input 6
        newModel.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
            inputShape: [6],
            weights: [
                tf.tensor2d(weightsData[0].kernel),
                tf.tensor1d(weightsData[0].bias)
            ]
        }));

        // Layer 2: Dense 12, ReLU
        newModel.add(tf.layers.dense({
            units: 12,
            activation: 'relu',
            weights: [
                tf.tensor2d(weightsData[1].kernel),
                tf.tensor1d(weightsData[1].bias)
            ]
        }));

        // Layer 3: Dense 4, Softmax
        newModel.add(tf.layers.dense({
            units: 4,
            activation: 'softmax',
            weights: [
                tf.tensor2d(weightsData[2].kernel),
                tf.tensor1d(weightsData[2].bias)
            ]
        }));

        model = newModel;
        console.log("[AI Cortex] Model reconstructed successfully from weights.");
    } catch (e) {
        console.error("[AI Cortex] Failed to load model:", e);
    } finally {
        isModelLoading = false;
    }
}

// Trigger load immediately
loadModel();

export async function analyzeVitals(vitals: VitalSigns): Promise<AIAnalysis> {
    // Try ML prediction first if model is loaded
    if (model) {
        try {
            const input = tf.tensor2d([[
                vitals.hr / 220,
                vitals.sbp / 250,
                vitals.dbp / 150,
                vitals.spo2 / 100,
                vitals.rr / 60,
                vitals.temp / 45
            ]]);

            const prediction = model.predict(input) as tf.Tensor;
            const probabilities = await prediction.data();
            input.dispose();
            prediction.dispose();

            // Find max probability index
            let maxIdx = 0;
            let maxProb = probabilities[0];
            for (let i = 1; i < probabilities.length; i++) {
                if (probabilities[i] > maxProb) {
                    maxProb = probabilities[i];
                    maxIdx = i;
                }
            }

            // Map index to Priority (Index 0 -> P1, 1 -> P2, 2 -> P3, 3 -> P4)
            // Wait, our python script mapped:
            // P1 -> 0
            // P2 -> 1
            // P3 -> 2
            // P4 -> 3 (default)
            // So Index + 1 = Priority
            const priority = (maxIdx + 1) as PriorityLevel;

            return {
                priority,
                summary: `ML Prediction (Confidence: ${(maxProb * 100).toFixed(1)}%)`,
                reasoning: "Pattern matching based on historical VitalDB cases.",
                suggested_action: getActionForPriority(priority),
                timestamp: Date.now(),
                source: 'TensorFlow.js (VitalDB Trained)'
            };

        } catch (e) {
            console.error("[AI Cortex] ML Prediction failed:", e);
        }
    }

    // Fallback to Ollama or Rules if ML fails
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const prompt = JSON.stringify({
            hr: vitals.hr,
            sbp: vitals.sbp,
            dbp: vitals.dbp,
            spo2: vitals.spo2,
            rr: vitals.rr,
            temp: vitals.temp,
        });

        // console.log(`[AI Cortex] Sending request to ${OLLAMA_URL} (Model: ${MODEL_NAME})...`);

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                system: SYSTEM_PROMPT,
                prompt: `Analyze these vitals: ${prompt}`,
                stream: false,
                format: "json"
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // Silent fail to fallback
            throw new Error("Ollama unavailable");
        }

        const data = await response.json();
        const result = JSON.parse(data.response);

        return {
            ...result,
            timestamp: Date.now(),
            source: `Ollama (${MODEL_NAME})`
        };

    } catch (error) {
        // console.error("[AI Cortex] Analysis failed:", error);
        return runFallbackAnalysis(vitals);
    }
}

function getActionForPriority(p: PriorityLevel): string {
    switch (p) {
        case 1: return "ACTIVATE RAPID RESPONSE TEAM IMMEDIATELY.";
        case 2: return "Urgent assessment required. Check ABCs.";
        case 3: return "Increase monitoring frequency.";
        case 4: return "Continue routine monitoring.";
        default: return "Monitor.";
    }
}

function runFallbackAnalysis(vitals: VitalSigns): AIAnalysis {
    let priority: PriorityLevel = 4;
    let summary = "Patient is stable.";
    let reasoning = "Vitals are within normal limits.";
    let action = "Continue monitoring.";

    // Logic mirroring the Decision Matrix
    if (vitals.hr < 40 || (vitals.sbp < 90 && vitals.hr > 100) || vitals.spo2 < 85 || vitals.rr > 30) {
        priority = 1;
        summary = "CRITICAL INSTABILITY DETECTED";
        if (vitals.spo2 < 85) reasoning = "Severe Hypoxia detected.";
        else if (vitals.sbp < 90) reasoning = "Signs of Severe Shock (Hypotension + Tachycardia).";
        else reasoning = "Critical vital sign derangement.";
        action = "ACTIVATE RAPID RESPONSE TEAM IMMEDIATELY.";
    } else if (vitals.sbp < 100 || (vitals.spo2 >= 85 && vitals.spo2 < 90) || vitals.hr > 120 || (vitals.temp > 39 && vitals.hr > 100)) {
        priority = 2;
        summary = "Urgent Clinical Deterioration";
        if (vitals.temp > 39) reasoning = "Sepsis alert: High fever with tachycardia.";
        else if (vitals.spo2 < 90) reasoning = "Hypoxia detected.";
        else reasoning = "Hemodynamic instability.";
        action = "Assess airway, breathing, circulation. Consider fluid bolus or O2 therapy.";
    } else if ((vitals.hr > 100 && vitals.hr <= 120) || vitals.sbp > 160 || (vitals.spo2 >= 90 && vitals.spo2 < 94)) {
        priority = 3;
        summary = "Abnormal Vitals - Warning";
        reasoning = "Vitals deviating from baseline.";
        action = "Increase monitoring frequency. Check patient comfort/pain.";
    }

    return {
        priority,
        summary,
        reasoning,
        suggested_action: action,
        timestamp: Date.now(),
        source: 'Fallback (Rule Engine)'
    };
}
