
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
}

export function Card({ className, title, children, ...props }: CardProps) {
    return (
        <div className={twMerge("bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-white/20", className)} {...props}>
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="text-white font-bold text-lg tracking-wide bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}
