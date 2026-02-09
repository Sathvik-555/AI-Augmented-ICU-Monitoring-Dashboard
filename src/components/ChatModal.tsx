import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { sendAIChatMessage } from '../lib/api';
import ReactMarkdown from 'react-markdown';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export function ChatModal({ isOpen, onClose, patientId, patientName }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const data = await sendAIChatMessage(patientId, userMsg);
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Error: Could not connect to AI." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md h-[600px] rounded-xl flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Bot className="text-blue-400 w-5 h-5" />
                        <h3 className="font-bold text-slate-100">Consult AI - {patientName}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-500 mt-10">
                            <p>Ask about medical history, medications, or current status.</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                }`}>
                                <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-lg rounded-bl-none text-slate-400 text-xs animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a question..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
