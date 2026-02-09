import { Card } from './Card';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface VitalCardProps {
    label: string;
    value: string | number;
    unit: string;
    icon: LucideIcon;
    color: string;
    onClick?: () => void;
}

export function VitalCard({ label, value, unit, icon: Icon, color, onClick }: VitalCardProps) {
    return (
        <div onClick={onClick} className={clsx(
            "relative flex flex-col items-center justify-center py-8 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 bg-slate-800/50 rounded-xl border border-white/5",
            onClick && "cursor-pointer hover:bg-slate-800/80 active:scale-95"
        )}>
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-3 bg-slate-800/50 rounded-full border border-white/5 group-hover:scale-110 group-hover:bg-slate-800/80 transition-all duration-300 shadow-inner">
                    <Icon className={clsx("w-6 h-6 transition-colors duration-300", color.replace('text-', 'text-'))} />
                </div>

                <div className="text-center">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {label}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={clsx("text-4xl font-black tracking-tight drop-shadow-lg", color)}>
                            {value}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">{unit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
