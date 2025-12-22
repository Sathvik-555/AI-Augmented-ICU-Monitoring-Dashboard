import { AIAnalysis } from '../lib/ai-service';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface AlertFeedProps {
    alerts: AIAnalysis[];
    onDismiss: (timestamp: number) => void;
}

export function AlertFeed({ alerts, onDismiss }: AlertFeedProps) {
    if (alerts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 w-96 space-y-3 z-50">
            {alerts.map((alert) => (
                <div
                    key={alert.timestamp}
                    className={clsx(
                        "p-4 rounded-lg shadow-xl border-l-4 flex gap-3 items-start animate-in slide-in-from-right duration-300",
                        alert.priority === 1
                            ? "bg-red-950/90 border-red-500 text-red-100"
                            : "bg-orange-950/90 border-orange-500 text-orange-100"
                    )}
                >
                    <AlertTriangle className={clsx(
                        "w-5 h-5 mt-0.5 flex-shrink-0",
                        alert.priority === 1 ? "text-red-500" : "text-orange-500"
                    )} />

                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-1">
                            {alert.priority === 1 ? "CRITICAL ALERT" : "URGENT ALERT"}
                        </h4>
                        <p className="text-xs opacity-90 line-clamp-2">{alert.summary}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] opacity-60">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                    </div>

                    <button
                        onClick={() => onDismiss(alert.timestamp)}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
