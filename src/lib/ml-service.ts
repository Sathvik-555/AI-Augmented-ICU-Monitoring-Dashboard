import * as tf from '@tensorflow/tfjs';
import { VitalSigns } from './simulator';
import { calculatePriority, PriorityLevel } from './ai-service';

let model: tf.Sequential | null = null;
let isTraining = false;

// Normalization constants to scale inputs between 0 and 1 roughly
const MAX_VALS = {
    hr: 220,
    sbp: 250,
    dbp: 150,
    spo2: 100,
    rr: 60,
    temp: 45
};

function normalize(vitals: VitalSigns): number[] {
    return [
        Math.min(vitals.hr / MAX_VALS.hr, 1),
        Math.min(vitals.sbp / MAX_VALS.sbp, 1),
        Math.min(vitals.dbp / MAX_VALS.dbp, 1),
        Math.min(vitals.spo2 / MAX_VALS.spo2, 1),
        Math.min(vitals.rr / MAX_VALS.rr, 1),
        Math.min(vitals.temp / MAX_VALS.temp, 1)
    ];
}

// function generateSyntheticData(count: number) {
//     const inputs: number[][] = [];
//     const labels: number[] = [];

//     for (let i = 0; i < count; i++) {
//         // Generate random vitals covering a wide range
//         const vitals: VitalSigns = {
//             hr: Math.random() * 180 + 30,    // 30 - 210
//             sbp: Math.random() * 180 + 60,   // 60 - 240
//             dbp: Math.random() * 100 + 40,   // 40 - 140
//             spo2: Math.random() * 30 + 70,   // 70 - 100
//             rr: Math.random() * 40 + 8,      // 8 - 48
//             temp: Math.random() * 8 + 34,    // 34 - 42
//             timestamp: Date.now()
//         };

//         const { priority } = calculatePriority(vitals);

//         inputs.push(normalize(vitals));
//         // Map priority 1-4 to class index 0-3
//         labels.push(priority - 1);
//     }

//     return {
//         inputs: tf.tensor2d(inputs),
//         labels: tf.oneHot(tf.tensor1d(labels, 'int32'), 4)
//     };
// }

// Reconstruct model from manual weights
async function loadModelFromWeights() {
    if (model || isTraining) return;
    isTraining = true;
    try {
        console.log("[ML Service] Loading model weights from /models/vital-monitor/manual_weights.json...");
        const response = await fetch('/models/vital-monitor/manual_weights.json');
        if (!response.ok) throw new Error("Failed to fetch weights");

        const weightsData = await response.json();

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
        console.log("[ML Service] Model constructed from weights successfully.");

    } catch (error) {
        console.error('[ML Service] Failed to load model weights:', error);
    } finally {
        isTraining = false;
    }
}

export async function predictPriority(vitals: VitalSigns): Promise<{ priority: PriorityLevel; confidence: number }> {
    if (!model) {
        await loadModelFromWeights();
    }

    if (!model) {
        // Fallback if training failed
        const { priority } = calculatePriority(vitals);
        return { priority, confidence: 1.0 };
    }

    const inputTensor = tf.tensor2d([normalize(vitals)]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const data = await prediction.data();

    // Find index with max probability
    let maxProb = -1;
    let maxIndex = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i] > maxProb) {
            maxProb = data[i];
            maxIndex = i;
        }
    }

    inputTensor.dispose();
    prediction.dispose();

    // Map index 0-3 back to priority 1-4
    return {
        priority: (maxIndex + 1) as PriorityLevel,
        confidence: maxProb
    };
}