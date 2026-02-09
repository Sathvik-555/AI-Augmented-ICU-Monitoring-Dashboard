
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Wind } from 'lucide-react';
import { VitalSigns } from '../lib/simulator';

interface OrganVisualizerProps {
    type: 'heart' | 'lungs' | null;
    vitals: VitalSigns;
    onClose: () => void;
}

export function OrganVisualizer({ type, vitals, onClose }: OrganVisualizerProps) {
    if (!type) return null;

    const isHeart = type === 'heart';
    const rate = isHeart ? vitals.hr : vitals.rr;
    const duration = 60 / rate; // Correct duration in seconds

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-8 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                {isHeart ? <Heart className="text-red-500 fill-red-500 animate-pulse" /> : <Wind className="text-blue-400" />}
                                {isHeart ? 'Cardiac Simulation' : 'Pulmonary Simulation'}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                driven by live sensor data ({rate} {isHeart ? 'BPM' : 'RR'})
                            </p>
                        </div>

                        <div className="h-64 w-64 flex items-center justify-center relative">
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 blur-[60px] opacity-30 ${isHeart ? 'bg-red-500' : 'bg-blue-500'}`} />

                            {isHeart ? (
                                // 3D Heart SVG Representation
                                <motion.svg
                                    viewBox="0 0 24 24"
                                    className="w-48 h-48 drop-shadow-2xl"
                                    animate={{
                                        scale: [1, 1.15, 1], // Systole/Diastole
                                    }}
                                    transition={{
                                        duration: duration,
                                        repeat: Infinity,
                                        ease: "easeInOut" // Smooth heartbeat
                                    }}
                                >
                                    <path
                                        fill="#ef4444" // red-500
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    />
                                    {/* Additional detail lines for 3D look could be added here */}
                                </motion.svg>
                            ) : (
                                // Lung SVG Representation
                                <div className="flex gap-2">
                                    {/* Left Lung */}
                                    <motion.svg
                                        viewBox="0 0 24 24"
                                        className="w-24 h-24 drop-shadow-xl"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.8, 1, 0.8]
                                        }}
                                        transition={{
                                            duration: duration,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <path
                                            fill="#60a5fa" // blue-400
                                            d="M12.5,2C12.5,2 12.5,2 12.5,2C12.5,2 18,3 18,9C18,15 16,19 12.5,22C12.5,22 13,17 12.5,14C12,11 11.5,5 12.5,2Z"
                                            transform="scale(-1, 1) translate(-24, 0)" // Flip for left lobe look (approx)
                                        />
                                        {/* Better Lung Shape approximation using standard paths */}
                                        <path fill="#60a5fa" d="M12 2L12 22C8 20 4 15 4 8C4 4 8 2 12 2Z" opacity="0.9" />
                                    </motion.svg>

                                    {/* Right Lung */}
                                    <motion.svg
                                        viewBox="0 0 24 24"
                                        className="w-24 h-24 drop-shadow-xl"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.8, 1, 0.8]
                                        }}
                                        transition={{
                                            duration: duration,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <path fill="#60a5fa" d="M12 2L12 22C16 20 20 15 20 8C20 4 16 2 12 2Z" opacity="0.9" />
                                    </motion.svg>
                                </div>
                            )}
                        </div>

                        <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Current Rate</span>
                                <span className="bg-slate-700 px-2 py-1 rounded font-mono text-white">{rate.toFixed(0)}</span>
                            </div>
                            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${isHeart ? 'bg-red-500' : 'bg-blue-500'}`}
                                    animate={{ width: isHeart ? `${(vitals.hr / 200) * 100}%` : `${(vitals.rr / 60) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                <span>Min: {isHeart ? 40 : 10}</span>
                                <span>Max: {isHeart ? 200 : 60}</span>
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                            Live {isHeart ? 'ECG' : 'Ventilation'} Sync Active
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
