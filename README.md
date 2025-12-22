# AI-Augmented ICU Monitoring Dashboard

This project is an **AI-Augmented ICU Monitoring Dashboard** designed to interpret vital sign streams, generate natural language summaries, and prioritize alerts to mitigate "Alarm Fatigue" in clinical settings.

The system uses a hybrid AI approach:
1.  **Quantitative Analysis**: A **TensorFlow.js** neural network (trained on VitalDB data) runs in the browser to predict clinical priority (Critical, Urgent, Warning, Normal) in real-time.
2.  **Qualitative Analysis**: A local Large Language Model (**Ollama**) acts as an "AI Cortex", providing human-readable explanations, reasoning, and actionable recommendations based on the quantitative data.

## Features

*   **Real-time Vital Signs Monitoring**: Simulates or reads live ICU data (Heart Rate, BP, SpO2, RR, Temp).
*   **AI Cortex**: Integrated with Ollama to provide clinical contextual analysis.
*   **Intelligent Priority System**: Predictive model (not just if-else rules) to classify patient status.
*   **Visual Dashboard**: Modern, responsive UI built with React & Tailwind CSS.
*   **Offline Mode**: All AI components (TF.js model and Ollama) run locally, ensuring privacy and reliability without internet.

## Tech Stack

*   **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React.
*   **AI/ML (Browser)**: TensorFlow.js.
*   **AI/ML (Backend/Training)**: Python, TensorFlow (Keras), VitalDB (for training data).
*   **LLM Integration**: Ollama (running local models like `llama3` or `mistral`).

## Prerequisites

*   **Node.js** (v18+)
*   **Python** (v3.9) (Required for model training)
*   **Ollama**: Install from [ollama.com](https://ollama.com/)

## Setup & Installation

### 1. Clone various components
```bash
git clone <repository-url>
cd AIML_Lab_Antigravity
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Setup Ollama (The Brain)
Ensure Ollama is installed and running. Pull the model you intend to use (default is usually `llama3` or `mistral`, check `src/lib/ai-service.ts` if unsure):
```bash
ollama pull llama3
ollama serve
```

### 4. Run the Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## Model Training (Optional)

The project includes a pre-trained model in `public/models/vital-monitor`. If you wish to retrain it using fresh data from VitalDB:

1.  Set up the Python environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    pip install -r requirements.txt
    ```

2.  Run the training script:
    ```bash
    python scripts/train_model.py
    ```
    This will:
    *   Fetch real clinical cases from VitalDB.
    *   Label them using expert clinical system rules.
    *   Train a Neural Network.
    *   Convert and save the model to `public/models/vital-monitor` for the frontend to use.

## Project Structure

*   `src/`: Frontend React application.
    *   `src/lib/simulator.ts`: Simulates patient vital signs.
    *   `src/lib/ai-service.ts`: Handles communication with Ollama.
*   `scripts/`: Python scripts for data fetching and model training.
*   `public/models/`: Contains the converted TensorFlow.js model files.

## License

[MIT](LICENSE)
