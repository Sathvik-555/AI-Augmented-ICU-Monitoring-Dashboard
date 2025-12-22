# 🏥 AI-Augmented ICU Monitoring Dashboard

An advanced dashboard that monitors patient vital signs and uses local AI to provide real-time clinical insights and priority alerts.

## ✨ Features

*   **Real-time Monitoring**: Visualizes live vital signs (Heart Rate, BP, SpO2, RR, Temp).
*   **AI Cortex**: Uses a local Large Language Model (**Ollama**) to explain patient status in plain English.
*   **Smart Alerts**: A neural network (TensorFlow.js) predicts clinical priority levels (Critical, Urgent, Warning, Normal).
*   **Offline Privacy**: All data processing and AI analysis happen locally on your machine.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18 or higher): [Download Link](https://nodejs.org/)
2.  **Ollama**: [Download Link](https://ollama.com/)
3.  **(Optional) Python 3.9**: Only required if you plan to retrain the ML model.

---

## 🚀 How to Run the Project

Follow these steps to get the dashboard up and running.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sathvik-555/AI-Augmented-ICU-Monitoring-Dashboard.git
cd AI-Augmented-ICU-Monitoring-Dashboard
```

### Step 2: Install Frontend Dependencies

This project uses Vite and React. Install the necessary packages:

```bash
npm install
```

### Step 3: Start the AI Engine (Ollama)

The dashboard relies on Ollama for its "AI Cortex" feature.

1.  Open a terminal and pull the AI model (we recommend `llama3`):
    ```bash
    ollama pull llama3
    ```
2.  Start the Ollama server:
    ```bash
    ollama serve
    ```
    ⚠️ **Keep this terminal window open.** The dashboard communicates with this local server.

### Step 4: Start the Dashboard

Open a **new** terminal window in the project directory and run:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. You should see the dashboard with live simulated data.

---

## 🧠 Model Training (Advanced & Optional)

The dashboard comes with a pre-trained neural network (`public/models/vital-monitor`). You **ONLY** need to follow these steps if you want to retrain the model with fresh data from VitalDB.

### 1. Setup Python Environment
We recommend using **Python 3.9**.

```bash
# Create a virtual environment
python -m venv venv

# Activate the environment (Windows)
.\venv\Scripts\activate

# Install dependencies from requirements.txt
pip install -r requirements.txt
```

### 2. Run the Training Script
This script fetches data, trains a new model, and converts it for the web.

```bash
python scripts/train_model.py
```

The new model files will be automatically saved to `public/models/vital-monitor`, ready for the frontend to use.

---

## 📂 Project Structure

*   `src/` - React frontend code.
    *   `components/` - UI components (Graphs, Feed, Cards).
    *   `lib/` - Logic for AI services and Data Simulation.
*   `scripts/` - Python scripts for ML training.
*   `public/models/` - The converted TensorFlow.js model.

## 📄 License

[MIT](LICENSE)
