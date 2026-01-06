import { useState, useEffect, useRef } from 'react';
import { useVitalSimulator, ClinicalScenario } from '../lib/simulator';
import { analyzeVitals, AIAnalysis, runFallbackAnalysis, AIConfig } from '../lib/ai-service';
import { VitalsGraph } from './VitalsGraph';
import { AICortex } from './AICortex';
import { AlertFeed } from './AlertFeed';
import { VitalCard } from './VitalCard';
import { Activity, Heart, Wind, Thermometer, ArrowLeft } from 'lucide-react';
import { PatientConfig } from './PatientMiniCard';

interface SinglePatientViewProps {
    patient: PatientConfig;
    onBack: () => void;
    aiSettings: AIConfig;
}

export function SinglePatientView({ patient, onBack, aiSettings }: SinglePatientViewProps) {
    // Use the scenario from the passed patient config
    const [scenario] = useState<ClinicalScenario>(patient.scenario);
    const { vitals, history } = useVitalSimulator(scenario);

    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [alerts, setAlerts] = useState<AIAnalysis[]>([]);
    const lastAlertTime = useRef<number>(0);
    const vitalsRef = useRef(vitals);

    // Keep vitals ref updated
    useEffect(() => {
        vitalsRef.current = vitals;
    }, [vitals]);

    // Immediate priority update
    useEffect(() => {
        const immediateAnalysis = runFallbackAnalysis(vitals);
        setAnalysis(prev => {
            if (!prev || prev.source.includes('Fallback')) return immediateAnalysis;
            return prev;
        });

        const now = Date.now();
        if (immediateAnalysis.priority <= 2 && (now - lastAlertTime.current > 10000)) {
            setAlerts(prev => [...prev, immediateAnalysis]);
            lastAlertTime.current = now;
        }
    }, [vitals]);

    // AI Analysis Interval
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isAnalyzing) return;
            setIsAnalyzing(true);
            try {
                const result = await analyzeVitals(vitalsRef.current, aiSettings);
                setAnalysis(result);
            } catch (e) {
                console.error("AI Analysis failed", e);
            }
            setIsAnalyzing(false);
        }, 3000);
        return () => clearInterval(interval);
    }, [aiSettings]);

    const handleDismiss = (timestamp: number) => {
        setAlerts(prev => prev.filter(a => a.timestamp !== timestamp));
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Ward
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{patient.bed} <span className="text-slate-500 text-lg font-normal">| {patient.name}</span></h1>
                    <p className="text-slate-400">Real-time Bedside Monitor</p>
                </div>
                <div className="bg-clinical-800 px-3 py-1 rounded text-xs font-mono text-slate-300">
                    SCENARIO: {patient.scenario}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <VitalCard label="Heart Rate" value={vitals.hr} unit="bpm" icon={Heart} color="text-red-400" />
                        <VitalCard label="Blood Pressure" value={`${vitals.sbp}/${vitals.dbp}`} unit="mmHg" icon={Activity} color="text-blue-400" />
                        <VitalCard label="SpO2" value={vitals.spo2} unit="%" icon={Wind} color="text-green-400" />
                        <VitalCard label="Temp" value={vitals.temp} unit="°C" icon={Thermometer} color="text-orange-400" />
                    </div>
                    <VitalsGraph data={history} />
                </div>

                <div className="lg:col-span-4">
                    <AICortex analysis={analysis} loading={isAnalyzing} />
                </div>
            </div>

            <AlertFeed alerts={alerts} onDismiss={handleDismiss} />
        </div>
    );
}
