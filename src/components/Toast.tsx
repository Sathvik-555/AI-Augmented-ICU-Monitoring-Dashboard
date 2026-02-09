
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss after 5s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />; // Critical alert style
            case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
            case 'info': return <Mail className="w-5 h-5 text-blue-400" />; // Email style
            default: return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                layout
                                className="bg-slate-900 border border-slate-700 shadow-2xl rounded-lg p-4 w-80 flex items-start gap-3 backdrop-blur-md"
                            >
                                <div className="mt-0.5">{getIcon(toast.type)}</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-slate-200 capitalize">
                                        {toast.type === 'error' ? 'Critical Alert' : toast.type === 'info' ? 'Email Sent' : 'Notification'}
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-tight mt-1">{toast.message}</p>
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}
