import { useState } from 'react';
import { X } from 'lucide-react';

interface AdmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdmit: (data: any) => void;
    bedLabel: string;
}

export function AdmitModal({ isOpen, onClose, onAdmit, bedLabel }: AdmitModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        condition: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-clinical-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Admit Patient to {bedLabel}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Patient Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
                            <select
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Condition</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Sepsis, Pneumonia"
                            className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
                            value={formData.condition}
                            onChange={e => setFormData({ ...formData, condition: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-900/20"
                        >
                            Admit Patient
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
