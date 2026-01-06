import { Card } from './Card';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface VitalCardProps {
    label: string;
    value: string | number;
    unit: string;
    icon: LucideIcon;
    color: string;
}

export function VitalCard({ label, value, unit, icon: Icon, color }: VitalCardProps) {
    return (
        <Card className="flex flex-col items-center justify-center py-6 hover:bg-clinical-700/50 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm uppercase tracking-wider">
                <Icon className="w-4 h-4" /> {label}
            </div>
            <div className={clsx("text-3xl font-bold tabular-nums", color)}>
                {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
            </div>
        </Card>
    );
}
