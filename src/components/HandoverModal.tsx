import { useEffect, useState } from 'react';
import { X, Copy, Check, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchHandoverReport } from '../lib/api';

interface HandoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
    vitals: any;
}

export function HandoverModal({ isOpen, onClose, patientId, patientName, vitals }: HandoverModalProps) {
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && patientId) {
            generateReport();
        }
    }, [isOpen, patientId]);

    const generateReport = async () => {
        setLoading(true);
        setReport('');
        try {
            const data = await fetchHandoverReport(patientId, vitals);
            setReport(data.report);
        } catch (error) {
            setReport("Error generating report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(report);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl h-[80vh] rounded-xl flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <FileText className="text-purple-400 w-5 h-5" />
                        <h3 className="font-bold text-slate-100">Shift Handover Report - {patientName}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 animate-pulse">Generating SBAR Report...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                    {!loading && (
                        <button
                            onClick={handleCopy}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Report'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
