import { useState, useEffect, useRef } from 'react';
import { useVitalSimulator, ClinicalScenario } from './lib/simulator';
import { analyzeVitals, AIAnalysis, runFallbackAnalysis } from './lib/ai-service';
import { VitalsGraph } from './components/VitalsGraph';
import { AICortex } from './components/AICortex';
import { AlertFeed } from './components/AlertFeed';
import { Card } from './components/Card';
import { Activity, Heart, Wind, Thermometer } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
    const [scenario, setScenario] = useState<ClinicalScenario>('NORMAL');
    const { vitals, history, isLoading } = useVitalSimulator(scenario);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [alerts, setAlerts] = useState<AIAnalysis[]>([]);
    const lastAlertTime = useRef<number>(0);
    const vitalsRef = useRef(vitals);

    // Keep vitals ref updated
    useEffect(() => {
        vitalsRef.current = vitals;
    }, [vitals]);

    // Immediate priority update when vitals change
    useEffect(() => {
        // Calculate priority instantly using fallback analysis
        const immediateAnalysis = runFallbackAnalysis(vitals);

        // Only update with fallback if there's no current analysis or current is also fallback
        setAnalysis(prev => {
            if (!prev || prev.source.includes('Fallback')) {
                return immediateAnalysis;
            }
            // Keep the Ollama analysis, don't overwrite it
            return prev;
        });

        // Check for alerts immediately
        const now = Date.now();
        if (immediateAnalysis.priority <= 2 && (now - lastAlertTime.current > 10000)) {
            setAlerts(prev => [...prev, immediateAnalysis]);
            lastAlertTime.current = now;
        }
    }, [vitals]);

    // Enhance with AI analysis every 3 seconds (stable interval)
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isAnalyzing) return;
            setIsAnalyzing(true);
            try {
                const result = await analyzeVitals(vitalsRef.current);
                // Always update with AI result - it has better summary/reasoning
                setAnalysis(result);
            } catch (e) {
                console.error("[App] AI enhancement failed", e);
            }
            setIsAnalyzing(false);
        }, 3000);
        return () => clearInterval(interval);
    }, []); // Empty dependency - only create interval once

    const handleDismiss = (timestamp: number) => {
        setAlerts(prev => prev.filter(a => a.timestamp !== timestamp));
    };

    return (
        <div className="min-h-screen bg-clinical-900 text-clinical-100 p-6 font-sans relative">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        AI-Augmented ICU Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm">Real-time Intelligent Monitoring System</p>
                </div>

                <div className="flex gap-2">
                    {(['NORMAL', 'SEPSIS', 'RESPIRATORY_DISTRESS', 'CARDIAC_INSTABILITY', 'VITALDB_DEMO'] as ClinicalScenario[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setScenario(s)}
                            disabled={isLoading && s === 'VITALDB_DEMO'}
                            className={clsx(
                                "px-3 py-1 rounded text-xs font-semibold transition-all",
                                scenario === s
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                    : "bg-clinical-800 text-slate-400 hover:bg-clinical-700",
                                isLoading && s === 'VITALDB_DEMO' && "opacity-50 cursor-wait"
                            )}
                        >
                            {s === 'VITALDB_DEMO' ? (isLoading ? 'LOADING...' : 'REAL DATA (VITALDB)') : s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Vitals & Graph (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Current Vitals Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <VitalCard label="Heart Rate" value={vitals.hr} unit="bpm" icon={Heart} color="text-red-400" />
                        <VitalCard label="Blood Pressure" value={`${vitals.sbp}/${vitals.dbp}`} unit="mmHg" icon={Activity} color="text-blue-400" />
                        <VitalCard label="SpO2" value={vitals.spo2} unit="%" icon={Wind} color="text-green-400" />
                        <VitalCard label="Temp" value={vitals.temp} unit="°C" icon={Thermometer} color="text-orange-400" />
                    </div>

                    <VitalsGraph data={history} />
                </div>

                {/* Right Column: AI Cortex (4 cols) */}
                <div className="lg:col-span-4">
                    <AICortex analysis={analysis} loading={isAnalyzing} />
                </div>
            </div>

            <AlertFeed alerts={alerts} onDismiss={handleDismiss} />
        </div>
    );
}

function VitalCard({ label, value, unit, icon: Icon, color }: any) {
    return (
        <Card className="flex flex-col items-center justify-center py-6">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm uppercase tracking-wider">
                <Icon className="w-4 h-4" /> {label}
            </div>
            <div className={clsx("text-3xl font-bold tabular-nums", color)}>
                {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
            </div>
        </Card>
    );
}

export default App;
