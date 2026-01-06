import { useState, useEffect } from 'react';
import { X, Save, Settings as SettingsIcon, Database, Cpu } from 'lucide-react';

import { Card } from './Card';

interface Settings {
    ollamaUrl: string;
    modelName: string;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Settings) => void;
    initialSettings: Settings;
}

export function SettingsModal({ isOpen, onClose, onSave, initialSettings }: SettingsModalProps) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    // Reset settings to initial when modal opens
    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-clinical-800">
                    <div className="flex items-center gap-2 font-semibold text-white">
                        <SettingsIcon className="w-5 h-5 text-blue-400" />
                        System Configuration
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Database className="w-4 h-4 text-blue-400" />
                                Ollama API URL
                            </label>
                            <input
                                type="text"
                                value={settings.ollamaUrl}
                                onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                                placeholder="http://localhost:11434/api/generate"
                                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <p className="text-[10px] text-slate-500">
                                The endpoint where your local Ollama instance is running.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Cpu className="w-4 h-4 text-purple-400" />
                                Model Name
                            </label>
                            <input
                                type="text"
                                value={settings.modelName}
                                onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
                                placeholder="llama3.2:1b"
                                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <p className="text-[10px] text-slate-500">
                                The model tag to use for analysis (must be pulled in Ollama).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(settings);
                            onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </Card>
        </div>
    );
}
