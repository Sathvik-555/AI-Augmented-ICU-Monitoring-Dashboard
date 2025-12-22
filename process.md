# AI/ML Priority Prediction Model Documentation

## Overview
This document outlines the architecture and process of the Machine Learning model used in the AI-Augmented ICU Dashboard. The system has transitioned from a static rule-based engine to a probabilistic Neural Network running entirely in the browser using **TensorFlow.js**.

## 1. The Neural Network Architecture

The model is a **Sequential Deep Neural Network** designed to classify patient stability into one of four priority levels.

### Layer Structure
*   **Input Layer (Shape: 6)**: Accepts normalized vital signs.
*   **Hidden Layer 1 (Dense)**: 16 Neurons, `ReLU` activation. Captures non-linear relationships between vitals (e.g., the relationship between low BP and high HR).
*   **Hidden Layer 2 (Dense)**: 12 Neurons, `ReLU` activation. Refines features for classification.
*   **Output Layer (Dense)**: 4 Neurons, `Softmax` activation. Outputs a probability distribution across the 4 priority classes.

### Input Features
The model takes 6 vital signs as input, which are normalized to a 0-1 range to ensure stable training:
1.  **Heart Rate (HR)**: Normalized by 220.
2.  **Systolic BP (SBP)**: Normalized by 250.
3.  **Diastolic BP (DBP)**: Normalized by 150.
4.  **Oxygen Saturation (SpO2)**: Normalized by 100.
5.  **Respiratory Rate (RR)**: Normalized by 60.
6.  **Temperature (Temp)**: Normalized by 45.

## 2. Priority Levels (Classes)

The model predicts one of four clinical priority levels:

*   **Priority 1: CRITICAL (Red)**
    *   **Definition**: Immediate life-threatening instability.
    *   **Triggers**: Severe Bradycardia (<40), Shock (SBP <90 & HR >100), Severe Hypoxia (<85%), or Extreme Tachypnea (>30).
    *   **Action**: Activate Rapid Response Team immediately.

*   **Priority 2: URGENT (Orange)**
    *   **Definition**: Signs of acute deterioration or sepsis.
    *   **Triggers**: Hypotension (SBP <100), Hypoxia (85-90%), Tachycardia (>120), or Fever + Tachycardia (Sepsis signs).
    *   **Action**: Urgent assessment, fluid resuscitation, O2 therapy.

*   **Priority 3: WARNING (Yellow)**
    *   **Definition**: Abnormal values requiring attention but not immediately critical.
    *   **Triggers**: Mild Tachycardia (100-120), Hypertension (>160), or Mild Hypoxia (90-94%).
    *   **Action**: Increase monitoring frequency, check patient comfort.

*   **Priority 4: NORMAL (Green)**
    *   **Definition**: All vital signs within physiological limits.
    *   **Action**: Continue routine monitoring.

## 3. The Training Process

Since this is a demonstration system without a massive historical dataset, we use **Knowledge Distillation** from clinical rules to train the model.

### Step 1: Synthetic Data Generation
*   The system generates **2,000 synthetic patient snapshots**.
*   Random values are generated for all 6 vitals across a wide physiological range (e.g., HR from 30 to 210).
*   Each snapshot is labeled using the "Gold Standard" clinical rules (the `calculatePriority` function).
*   **Why?** This teaches the neural network to approximate the expert clinical logic, allowing it to generalize and handle edge cases probabilistically rather than rigidly.

### Step 2: In-Browser Training
*   **Framework**: TensorFlow.js
*   **Optimizer**: Adam (Learning Rate: 0.01)
*   **Loss Function**: Categorical Crossentropy (standard for multi-class classification).
*   **Epochs**: 20 (passes through the dataset).
*   **Batch Size**: 32.

The training happens automatically the first time a prediction is requested if a model doesn't exist. It typically takes 1-2 seconds on a modern client.

## 4. Inference & Confidence

When live patient data comes in:
1.  **Normalization**: The raw vitals are scaled using the same factors as training.
2.  **Prediction**: The model outputs 4 probabilities (e.g., `[0.01, 0.85, 0.10, 0.04]`).
3.  **ArgMax**: The index with the highest probability is selected as the predicted priority (e.g., Index 1 -> Priority 2).
4.  **Confidence Score**: The highest probability value (e.g., 85%) is returned as the confidence score.

## 5. Integration with LLM (Ollama)

The ML model works in tandem with the Large Language Model (Ollama):
1.  **ML Model**: Performs the quantitative analysis (Numbers -> Priority & Confidence).
2.  **LLM (Ollama)**: Performs the qualitative analysis. It receives the Vitals, the Predicted Priority, and the Confidence Score.
3.  **Output**: The LLM generates a human-readable summary ("Patient is showing signs of compensated shock...") and explains *why* the model likely flagged it, adding clinical nuance that a simple classifier cannot provide.
