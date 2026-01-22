import { useState } from 'react';
import { BodyMap, BodyPart } from './BodyMap';
import { Activity, Brain, Accessibility } from 'lucide-react';

interface AnatomyViewerProps {
    vitals: any;
    history: string;
}

export function AnatomyViewer({ vitals, history }: AnatomyViewerProps) {
    const [selectedPart, setSelectedPart] = useState<BodyPart>(null);

    const getPartInfo = (part: BodyPart) => {
        switch (part) {
            case 'head':
                return {
                    title: 'Neurological / Head',
                    icon: Brain,
                    metrics: [
                        { label: 'Consciousness', value: 'Alert' }, // Mock
                        { label: 'Temp', value: `${vitals.temp}°C` }
                    ],
                    keywords: ['neuro', 'head', 'brain', 'stroke', 'seizure', 'mental', 'anxiety']
                };
            case 'chest':
                return {
                    title: 'Cardio-Respiratory',
                    icon: Activity,
                    metrics: [
                        { label: 'Heart Rate', value: `${vitals.hr} bpm` },
                        { label: 'BP', value: `${vitals.sbp}/${vitals.dbp}` },
                        { label: 'SpO2', value: `${vitals.spo2}%` },
                        { label: 'Resp Rate', value: `${vitals.rr}/min` }
                    ],
                    keywords: ['heart', 'cardio', 'lung', 'resp', 'breath', 'chest', 'asthma', 'pneumonia', 'copd']
                };
            case 'abdomen':
                return {
                    title: 'Gastrointestinal / Renal',
                    icon: Accessibility, // Generic body icon
                    metrics: [
                        { label: 'Bowel Sounds', value: 'Present' } // Mock
                    ],
                    keywords: ['abdomen', 'stomach', 'liver', 'kidney', 'renal', 'gastro', 'pain']
                };
            case 'limbs':
                return {
                    title: 'Musculoskeletal / Integumentary',
                    icon: Accessibility,
                    metrics: [
                        { label: 'Movement', value: 'Full Range' }
                    ],
                    keywords: ['leg', 'arm', 'skin', 'rash', 'edema', 'fracture', 'mobility']
                };
            default:
                return null;
        }
    };

    const info = getPartInfo(selectedPart);

    // Simple keyword filtering for history lines
    const relevantHistory = selectedPart && history
        ? history.split('\n')
            .filter(line => info?.keywords.some(k => line.toLowerCase().includes(k)))
            .map(line => line.trim())
            .filter(line => line.length > 5)
        : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
            {/* Left: The Map */}
            <div className="bg-slate-900/50 rounded-xl p-8 flex items-center justify-center border border-slate-700">
                <div className="w-64 h-full">
                    <BodyMap selectedPart={selectedPart} onSelect={setSelectedPart} />
                </div>
                <div className="absolute bottom-4 left-4 text-slate-500 text-sm">
                    Click a body zone to view details
                </div>
            </div>

            {/* Right: The Data */}
            <div className="bg-clinical-800 rounded-xl p-6 border border-slate-700 overflow-y-auto">
                {selectedPart && info ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                            <div className="p-3 bg-blue-600/20 rounded-lg">
                                <info.icon className="w-8 h-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{info.title}</h2>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {info.metrics.map((m: any, i: number) => (
                                <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">{m.label}</p>
                                    <p className="text-xl font-mono text-white mt-1">{m.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Relevant History */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-slate-200">Related History</h3>
                            {relevantHistory.length > 0 ? (
                                <ul className="space-y-2">
                                    {relevantHistory.map((line, i) => (
                                        <li key={i} className="text-sm text-slate-300 bg-slate-700/30 p-2 rounded border-l-2 border-blue-500">
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 italic text-sm">No specific history records found for this system.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <Accessibility className="w-16 h-16 opacity-20" />
                        <p className="text-lg">Select a body area to inspect</p>
                    </div>
                )}
            </div>
        </div>
    );
}
