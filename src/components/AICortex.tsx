import { AIAnalysis } from '../lib/ai-service';
import { Card } from './Card';
import { Brain, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface AICortexProps {
    analysis: AIAnalysis | null;
    loading: boolean;
}

export function AICortex({ analysis, loading }: AICortexProps) {
    const getPriorityColor = (p: number) => {
        switch (p) {
            case 1: return 'text-clinical-alert-critical border-clinical-alert-critical bg-red-900/20';
            case 2: return 'text-clinical-alert-urgent border-clinical-alert-urgent bg-orange-900/20';
            case 3: return 'text-clinical-alert-warning border-clinical-alert-warning bg-yellow-900/20';
            default: return 'text-clinical-alert-normal border-clinical-alert-normal bg-green-900/20';
        }
    };

    return (
        <Card title="AI Cortex Analysis" className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                <Brain className={clsx("w-4 h-4", loading && "animate-pulse text-blue-400")} />
                {loading ? "Analyzing vitals stream..." : `Analysis Source: ${analysis?.source ?? 'Waiting...'}`}
            </div>

            {analysis ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={clsx("p-4 rounded-lg border-l-4", getPriorityColor(analysis.priority))}>
                        <div className="flex items-center gap-2 font-bold text-lg mb-1">
                            {analysis.priority === 1 && <AlertTriangle className="w-6 h-6" />}
                            {analysis.priority === 4 && <CheckCircle className="w-6 h-6" />}
                            {analysis.summary}
                        </div>
                        <div className="text-sm opacity-90">Priority Level: {analysis.priority}</div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Clinical Reasoning</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{analysis.reasoning}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Suggested Action</h4>
                        <p className="text-blue-200 text-sm font-medium">{analysis.suggested_action}</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                    <Activity className="w-12 h-12 opacity-20" />
                </div>
            )}
        </Card>
    );
}
