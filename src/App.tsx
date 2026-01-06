import { useState, useEffect } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { WardView } from './components/WardView';
import { SinglePatientView } from './components/SinglePatientView';
import { PatientConfig } from './components/PatientMiniCard';
import { Settings as SettingsIcon } from 'lucide-react';

// Mock Data for the Ward
const INITIAL_PATIENTS: PatientConfig[] = [
    { id: '1', bed: 'BED 01', name: 'John Doe', scenario: 'NORMAL' },
    { id: '2', bed: 'BED 02', name: 'Jane Smith', scenario: 'SEPSIS' },
    { id: '3', bed: 'BED 03', name: 'Robert Johnson', scenario: 'CARDIAC_INSTABILITY' },
    { id: '4', bed: 'BED 04', name: 'Emily Davis', scenario: 'RESPIRATORY_DISTRESS' },
    { id: '5', bed: 'BED 05', name: 'Michael Wilson', scenario: 'NORMAL' },
    { id: '6', bed: 'BED 06', name: 'Sarah Brown', scenario: 'NORMAL' },
];

function App() {
    const [view, setView] = useState<'ward' | 'single'>('ward');
    const [selectedPatient, setSelectedPatient] = useState<PatientConfig | null>(null);

    // Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [aiSettings, setAiSettings] = useState({
        ollamaUrl: '/api/ollama/generate',
        modelName: 'llama3.2:1b'
    });

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

    const handleSelectPatient = (patient: PatientConfig) => {
        setSelectedPatient(patient);
        setView('single');
    };

    const handleBackToWard = () => {
        setView('ward');
        setSelectedPatient(null);
    };

    return (
        <div className="min-h-screen bg-clinical-900 text-clinical-100 p-6 font-sans relative">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        AI-Augmented ICU Dashboard
                    </h1>
                </div>

                <div className="flex gap-2">
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
                {view === 'ward' ? (
                    <WardView
                        patients={INITIAL_PATIENTS}
                        onSelectPatient={handleSelectPatient}
                    />
                ) : (
                    selectedPatient && (
                        <SinglePatientView
                            patient={selectedPatient}
                            onBack={handleBackToWard}
                            aiSettings={aiSettings}
                        />
                    )
                )}
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

export default App;
