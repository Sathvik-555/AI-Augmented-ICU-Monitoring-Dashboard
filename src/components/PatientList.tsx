import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../lib/api';
import { ArrowRight, Bed, User } from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    condition: string;
    bed: { label: string; status: string } | null;
}

export function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients()
            .then(setPatients)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-10">Loading Patients...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-white mb-6">Patient List</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(patient => (
                    <div
                        key={patient.id}
                        onClick={() => navigate(`/patient/${patient.id}`)}
                        className="bg-clinical-800 rounded-xl p-6 border border-clinical-700 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/20 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-100">{patient.name}</h3>
                                    <span className="text-slate-400 text-sm">{patient.condition}</span>
                                </div>
                            </div>
                            {patient.bed && (
                                <div className={`px-2 py-1 rounded text-xs font-mono font-medium ${patient.bed.status === 'OCCUPIED' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                                    }`}>
                                    {patient.bed.label}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <div className="text-xs text-slate-500">ID: {patient.id.slice(0, 8)}</div>
                            <div className="text-blue-400 text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                View Profile <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
