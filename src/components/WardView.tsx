import { PatientMiniCard, PatientConfig } from './PatientMiniCard';
import { LayoutGrid } from 'lucide-react';

interface WardViewProps {
    patients: PatientConfig[];
    onSelectPatient: (patient: PatientConfig) => void;
}

export function WardView({ patients, onSelectPatient }: WardViewProps) {
    // Count stats
    // Note: In a real app we'd lift the state to sum these up live, 
    // but for this view we just render the cards which calculate their own state.
    // For the header summary, we might need to lift state later. 
    // For now, let's keep it simple.

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 p-4 bg-clinical-800/50 rounded-xl border border-white/5">
                <LayoutGrid className="w-6 h-6 text-blue-400" />
                <div>
                    <h2 className="text-xl font-bold text-white">ICU Central Station</h2>
                    <p className="text-sm text-slate-400">Ward A • 6 Active Beds</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map(patient => (
                    <PatientMiniCard
                        key={patient.id}
                        patient={patient}
                        onClick={onSelectPatient}
                    />
                ))}
            </div>
        </div>
    );
}
