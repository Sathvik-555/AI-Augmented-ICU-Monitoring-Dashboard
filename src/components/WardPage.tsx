import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBeds, admitPatient, dischargePatient } from '../lib/api';
import { PatientMiniCard, PatientConfig } from './PatientMiniCard';
import { ClinicalScenario } from '../lib/simulator';
import { AdmitModal } from './AdmitModal'; // Import AdmitModal
import { Plus } from 'lucide-react';

interface BedData {
    id: string;
    label: string;
    status: string;
    patient?: {
        id: string;
        name: string;
        condition: string;
    };
}

// Helper to map condition to scenario
function mapConditionToScenario(condition: string): ClinicalScenario {
    if (!condition) return 'NORMAL';
    const lower = condition.toLowerCase();
    if (lower.includes('sepsis')) return 'SEPSIS';
    if (lower.includes('heart') || lower.includes('cardiac')) return 'CARDIAC_INSTABILITY';
    if (lower.includes('asthma') || lower.includes('respiratory') || lower.includes('pneumonia')) return 'RESPIRATORY_DISTRESS';
    return 'NORMAL';
}

export function WardPage() {
    const [beds, setBeds] = useState<BedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState<BedData | null>(null);
    const [isAdmitOpen, setIsAdmitOpen] = useState(false);
    const navigate = useNavigate();

    const loadBeds = () => {
        setLoading(true);
        fetchBeds()
            .then(data => setBeds(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadBeds();
    }, []);

    const handleBedClick = (bed: BedData) => {
        if (bed.status === 'VACANT') {
            setSelectedBed(bed);
            setIsAdmitOpen(true);
        } else if (bed.patient) {
            // Include bed label and scenario for the card click logic which usually expects PatientConfig
            // But we can navigate directly
            navigate(`/patient/${bed.patient.id}`);
        }
    };

    const handleAdmit = async (data: any) => {
        if (!selectedBed) return;
        try {
            await admitPatient(selectedBed.id, data);
            setIsAdmitOpen(false);
            loadBeds(); // Refresh
        } catch (e) {
            alert('Admission Failed');
            console.error(e);
        }
    };

    const handleDischarge = async (bedId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Are you sure you want to discharge this patient?")) {
            try {
                await dischargePatient(bedId);
                loadBeds();
            } catch (err) {
                console.error(err);
                alert("Discharge failed");
            }
        }
    };

    if (loading) return <div className="text-center p-10">Loading ICU Ward...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-clinical-800/50 rounded-xl border border-white/5 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">ICU Central Station</h2>
                    <p className="text-sm text-slate-400">Ward A • {beds.filter(b => b.status === 'OCCUPIED').length} Active Patients</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beds.map(bed => (
                    bed.status === 'OCCUPIED' && bed.patient ? (
                        <div key={bed.id} className="relative group">
                            <PatientMiniCard
                                patient={{
                                    id: bed.patient.id,
                                    name: bed.patient.name,
                                    bed: bed.label,
                                    scenario: mapConditionToScenario(bed.patient.condition)
                                }}
                                onClick={() => handleBedClick(bed)}
                            />
                            <button
                                onClick={(e) => handleDischarge(bed.id, e)}
                                className="absolute top-2 right-2 bg-red-900/80 hover:bg-red-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Discharge
                            </button>
                        </div>
                    ) : (
                        <div
                            key={bed.id}
                            onClick={() => handleBedClick(bed)}
                            className="bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/50 hover:border-slate-500 transition-all group min-h-[160px]"
                        >
                            <div className="text-slate-500 font-bold group-hover:text-slate-300">{bed.label}</div>
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                                <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-400" />
                            </div>
                            <span className="text-sm text-slate-500 group-hover:text-blue-300 font-medium">Empty Bed - Admit Patient</span>
                        </div>
                    )
                ))}
            </div>

            <AdmitModal
                isOpen={isAdmitOpen}
                onClose={() => setIsAdmitOpen(false)}
                onAdmit={handleAdmit}
                bedLabel={selectedBed?.label || ''}
            />
        </div>
    );
}
