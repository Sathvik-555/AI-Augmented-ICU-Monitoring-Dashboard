import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SettingsModal } from './components/SettingsModal';
import { PatientList } from './components/PatientList';
import { WardPage } from './components/WardPage'; // Import WardPage
import { SinglePatientView } from './components/SinglePatientView';
import { Settings as SettingsIcon, LayoutDashboard, BedDouble } from 'lucide-react'; // Import BedDouble

function AppContent() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [aiSettings, setAiSettings] = useState({
        ollamaUrl: '/api/ollama/generate',
        modelName: 'llama3.2:1b'
    });
    const location = useLocation();

    useEffect(() => {
        const saved = localStorage.getItem('ai_settings');
        if (saved) {
            try { setAiSettings(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    const saveSettings = (newSettings: typeof aiSettings) => {
        setAiSettings(newSettings);
        localStorage.setItem('ai_settings', JSON.stringify(newSettings));
    };

    return (
        <div className="min-h-screen bg-clinical-900 text-clinical-100 p-6 font-sans relative">
            <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        AI-Augmented ICU Dashboard
                    </h1>
                </Link>

                <div className="flex gap-2">
                    <Link
                        to="/"
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${location.pathname === '/' ? 'bg-clinical-800 text-white' : 'text-slate-400 hover:text-white hover:bg-clinical-800'}`}
                        title="Bed List"
                    >
                        <BedDouble className="w-5 h-5" />
                        <span className="hidden sm:inline">Bed List</span>
                    </Link>

                    <Link
                        to="/patients"
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${location.pathname === '/patients' ? 'bg-clinical-800 text-white' : 'text-slate-400 hover:text-white hover:bg-clinical-800'}`}
                        title="Patient List"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="hidden sm:inline">Patient List</span>
                    </Link>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-clinical-800 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<WardPage />} />
                    <Route path="/patients" element={<PatientList />} />
                    <Route path="/patient/:id" element={<SinglePatientView aiSettings={aiSettings} />} />
                </Routes>
            </main>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={saveSettings}
                initialSettings={aiSettings}
            />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
