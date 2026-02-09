import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBeds, admitPatient, dischargePatient, movePatient } from '../lib/api';
import { PatientMiniCard } from './PatientMiniCard';
import { ClinicalScenario } from '../lib/simulator';
import { AdmitModal } from './AdmitModal';
import { Plus } from 'lucide-react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggablePatient } from './dnd/DraggablePatient';
import { DroppableBed } from './dnd/DroppableBed';

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

    // Use sensors with activation constraint to differentiate click vs drag
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 10 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // active.id is the bedId of the source/patient (wait, draggable ID logic needed)
            // Correction: DraggablePatient ID should be the source BED ID or Patient ID? 
            // My backend API needs source Bed ID. If I use Bed ID as Draggable ID, it's easier.
            // Let's assume Draggable ID = Source Bed ID. Over ID = Target Bed ID.

            const sourceBedId = active.id as string;
            const targetBedId = over.id as string;

            try {
                // Optimistic UI update could go here, but strict consistency is safer for now
                await movePatient(sourceBedId, targetBedId);
                loadBeds();
            } catch (error) {
                console.error("Move failed", error);
                alert("Failed to move patient. Target bed might be occupied.");
            }
        }
    };

    const handleBedClick = (bed: BedData) => {
        if (bed.status === 'VACANT') {
            setSelectedBed(bed);
            setIsAdmitOpen(true);
        } else if (bed.patient) {
            navigate(`/patient/${bed.patient.id}`);
        }
    };

    const handleAdmit = async (data: any) => {
        if (!selectedBed) return;
        try {
            await admitPatient(selectedBed.id, data);
            setIsAdmitOpen(false);
            loadBeds();
        } catch (e) {
            alert('Admission Failed');
            console.error(e);
        }
    };

    const handleDischarge = async (bedId: string, e: React.MouseEvent) => {
        e.stopPropagation();
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

    if (loading) return <div className="text-center p-10 text-slate-400 animate-pulse">Loading ICU Ward...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 mb-6 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ICU Central Station</h2>
                    <p className="text-sm text-slate-400">Ward A • {beds.filter(b => b.status === 'OCCUPIED').length} Active Patients</p>
                </div>
                <div className="ml-auto text-xs text-slate-500 italic">
                    Drag and drop to move patients
                </div>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beds.map(bed => (
                        <DroppableBed key={bed.id} id={bed.id} isOccupied={bed.status === 'OCCUPIED'}>
                            {bed.status === 'OCCUPIED' && bed.patient ? (
                                <DraggablePatient id={bed.id}> {/* Using Bed ID as draggable ID for easier API call */}
                                    <div className="relative group h-full">
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
                                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on button
                                            onClick={(e) => handleDischarge(bed.id, e)}
                                            className="absolute top-2 right-2 bg-red-900/80 hover:bg-red-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            Discharge
                                        </button>
                                    </div>
                                </DraggablePatient>
                            ) : (
                                <div
                                    onClick={() => handleBedClick(bed)}
                                    className="h-full min-h-[180px] bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/50 hover:border-slate-500 transition-all group"
                                >
                                    <div className="text-slate-500 font-bold group-hover:text-slate-300">{bed.label}</div>
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                                        <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                    <span className="text-sm text-slate-500 group-hover:text-blue-300 font-medium">Empty Bed</span>
                                </div>
                            )}
                        </DroppableBed>
                    ))}
                </div>
            </DndContext>

            <AdmitModal
                isOpen={isAdmitOpen}
                onClose={() => setIsAdmitOpen(false)}
                onAdmit={handleAdmit}
                bedLabel={selectedBed?.label || ''}
            />
        </div>
    );
}
