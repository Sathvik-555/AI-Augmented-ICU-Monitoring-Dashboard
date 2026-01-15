# 🏥 AI-Augmented ICU Monitoring Dashboard

An advanced full-stack dashboard that monitors patient vital signs, manages patient history, and uses local AI to provide real-time clinical insights and priority alerts.

## ✨ Features

*   **Real-time Monitoring**: Visualizes live vital signs (Heart Rate, BP, SpO2, RR, Temp).
*   **Patient Management**: Full admission and discharge workflow with bed management.
*   **Medical History**: Upload PDF medical records; the system parses and summarizes them for the AI.
*   **AI Cortex**: Uses a local Large Language Model (**Ollama**) to explain patient status in plain English, considering both real-time vitals and past medical history.
*   **Smart Alerts**: A neural network (TensorFlow.js) predicts clinical priority levels (Critical, Urgent, Warning, Normal).
*   **Data Persistence**: PostgreSQL database stores patient profiles, bed assignments, and medical records.
*   **Offline Privacy**: All AI processing happens locally on your machine.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18 or higher): [Download Link](https://nodejs.org/)
2.  **PostgreSQL** (v14 or higher): [Download Link](https://www.postgresql.org/)
3.  **Ollama**: [Download Link](https://ollama.com/)
4.  **(Optional) Python 3.9**: Only required if you plan to retrain the ML model.

---

## 🚀 How to Run the Project

This project consists of a **Frontend** (React/Vite) and a **Backend** (Node.js/Express). You need to run both.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sathvik-555/AI-Augmented-ICU-Monitoring-Dashboard.git
cd AI-Augmented-ICU-Monitoring-Dashboard
```

### Step 2: AI Engine Setup (Ollama)

1.  Install Ollama and pull the required model (we use `llama3.2:1b` for speed):
    ```bash
    ollama pull llama3.2:1b
    ```
2.  Start the Ollama server:
    ```bash
    ollama serve
    ```
    ⚠️ **Keep this running in the background.**

### Step 3: Backend Setup

The backend handles the database, file uploads, and AI coordination.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    Create a `.env` file in the `server` directory with your PostgreSQL credentials:
    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/icu_dashboard?schema=public"
    PORT=3001
    ```
    *Replace `username` and `password` with your local Postgres credentials.*

4.  **Setup Database:**
    Run migrations and seed initial data:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```

5.  **Start the Backend Server:**
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:3001`.

### Step 4: Frontend Setup

Open a **new terminal** in the project root directory.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Frontend:**
    ```bash
    npm run dev
    ```
3.  Open your browser and navigate to `http://localhost:5173`.

---

## 🧠 Model Training (Advanced & Optional)

The dashboard comes with a pre-trained neural network (`public/models/vital-monitor`). You **ONLY** need to follow these steps if you want to retrain the underlying TensorFlow.js model with fresh data.

1.  **Setup Python Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # or .\venv\Scripts\activate on Windows
    pip install -r requirements.txt
    ```
2.  **Run Training**:
    ```bash
    python scripts/train_model.py
    ```
    The new model will be saved to `public/models/vital-monitor`.

---

## 📂 Project Structure

*   `src/` - React Frontend
    *   `components/` - UI Components (Ward View, Patient Profile, Graphs).
    *   `lib/` - Frontend logic and API clients.
*   `server/` - Node.js Backend
    *   `prisma/` - Database schema and seeds.
    *   `src/routes/` - API endpoints (Patients, Beds, Uploads).
    *   `src/services/` - AI service logic.
*   `public/models/` - TensorFlow.js model files.
