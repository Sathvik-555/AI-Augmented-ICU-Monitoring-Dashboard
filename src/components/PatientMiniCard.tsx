import { useVitalSimulator, ClinicalScenario } from '../lib/simulator';
import { calculatePriority } from '../lib/ai-service';

import { Activity, Heart, Wind, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export interface PatientConfig {
    id: string;
    name: string;
    bed: string;
    scenario: ClinicalScenario;
}

interface PatientMiniCardProps {
    patient: PatientConfig;
    onClick: (patient: PatientConfig) => void;
}

export function PatientMiniCard({ patient, onClick }: PatientMiniCardProps) {
    // Each card runs its own simulation
    const { vitals } = useVitalSimulator(patient.scenario);
    const { priority } = calculatePriority(vitals);

    const getPriorityColor = (p: number) => {
        switch (p) {
            case 1: return 'border-red-500 bg-red-950/30 animate-pulse-slow';
            case 2: return 'border-orange-500 bg-orange-950/20';
            case 3: return 'border-yellow-500 bg-yellow-950/10';
            default: return 'border-clinical-700 hover:border-blue-500/50 bg-clinical-800';
        }
    };

    return (
        <div
            onClick={() => onClick(patient)}
            className={clsx(
                "relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
                getPriorityColor(priority)
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-white">{patient.bed}</h3>
                    <p className="text-xs text-slate-400">{patient.name}</p>
                </div>
                {priority <= 2 && (
                    <AlertTriangle className={clsx(
                        "w-5 h-5 animate-bounce",
                        priority === 1 ? "text-red-500" : "text-orange-500"
                    )} />
                )}
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-xl font-mono font-bold">{vitals.hr}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-xl font-mono font-bold">{vitals.sbp}/{vitals.dbp}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-green-400" />
                    <span className="text-xl font-mono font-bold">{vitals.spo2}%</span>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <div className={clsx(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                    priority === 1 ? "bg-red-500 text-black" :
                        priority === 2 ? "bg-orange-500 text-black" :
                            priority === 3 ? "bg-yellow-500 text-black" :
                                "bg-green-500/20 text-green-400"
                )}>
                    {priority === 1 ? 'Critical' : priority === 2 ? 'Urgent' : priority === 3 ? 'Warning' : 'Stable'}
                </div>
            </div>
        </div>
    );
}
