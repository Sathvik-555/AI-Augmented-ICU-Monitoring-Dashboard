# 🏥 AI-Augmented ICU Monitoring Dashboard

## 📋 Project Description

The AI-Augmented ICU Monitoring Dashboard is a comprehensive healthcare solution designed to revolutionize intensive care unit patient monitoring through intelligent automation and real-time analytics. This full-stack application combines modern web technologies with cutting-edge machine learning to provide healthcare professionals with actionable insights, predictive alerts, and seamless patient management capabilities.

Built with privacy and offline functionality in mind, the system processes all AI operations locally using Ollama (Large Language Model) and TensorFlow.js, ensuring patient data never leaves your infrastructure. The dashboard serves as a centralized command center for ICU operations, integrating vital sign monitoring, patient history management, bed allocation, and AI-powered clinical decision support.

**Key Technologies**: React, TypeScript, Node.js, Express, PostgreSQL, Prisma ORM, TensorFlow.js, Ollama LLM, Tailwind CSS

## ✨ Features

### 🩺 Real-Time Patient Monitoring
*   **Live Vital Signs Visualization**: Continuous tracking and display of Heart Rate, Blood Pressure, SpO2, Respiratory Rate, and Temperature
*   **Interactive Body Map**: Anatomical visualization showing vital sign locations and status indicators
*   **Dynamic Graphs**: Real-time plotting of vital trends with customizable time windows
*   **Color-Coded Status Indicators**: Instant visual feedback on patient stability

### 🏥 Patient Management System
*   **Complete Admission Workflow**: Streamlined patient intake with comprehensive demographic and clinical data collection
*   **Bed Assignment & Tracking**: Real-time bed occupancy management across ICU wards
*   **Patient Discharge Process**: Structured discharge workflow with handover notes and summary generation
*   **Patient Search & Filtering**: Quick access to patient records with advanced filtering options

### 📄 Medical History & Documentation
*   **PDF Upload & Parsing**: Upload medical records, lab results, and diagnostic reports
*   **Intelligent Document Processing**: Automatic extraction and summarization of medical documents
*   **Historical Data Integration**: Seamless integration of past medical history with current monitoring data
*   **Document Library**: Organized repository of all patient-related documents

### 🤖 AI-Powered Clinical Insights
*   **AI Cortex Chat Interface**: Natural language interaction with an AI assistant that understands patient context
*   **Contextual Analysis**: AI considers both real-time vitals and complete medical history for assessments
*   **Plain English Explanations**: Complex medical data translated into clear, actionable insights
*   **Local LLM Processing**: All AI operations run on-premises using Ollama for complete data privacy

### ⚠️ Smart Alert System
*   **Neural Network Priority Prediction**: TensorFlow.js model analyzes vital patterns to predict clinical urgency
*   **Four-Tier Alert Levels**: Critical, Urgent, Warning, and Normal classifications
*   **Real-Time Alert Feed**: Chronological display of all system alerts with timestamps
*   **Predictive Early Warning**: Identifies deteriorating patients before critical events

### 💾 Data Persistence & Security
*   **PostgreSQL Database**: Robust, enterprise-grade data storage
*   **Prisma ORM**: Type-safe database operations with migrations and schema management
*   **Structured Data Models**: Normalized database design for patients, beds, vitals, and medical records
*   **Offline-First Architecture**: Full functionality without external cloud dependencies

### 🔒 Privacy & Compliance
*   **Local AI Processing**: All machine learning and LLM operations happen on your infrastructure
*   **No External API Calls**: Patient data never transmitted to third-party services
*   **Secure File Storage**: Medical documents stored locally with proper access controls
*   **Audit Trail**: Comprehensive logging of all system operations

### 🎨 User Experience
*   **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS
*   **Responsive Design**: Optimized for desktop workstations and tablets
*   **Ward View Dashboard**: Overview of all active patients with key metrics at a glance
*   **Detailed Patient Profiles**: Comprehensive view combining vitals, history, and AI insights
*   **Mini Card Views**: Quick reference cards for rapid patient assessment

---

## ✨ Core Features Summary

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
