
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
}

export function Card({ className, title, children, ...props }: CardProps) {
    return (
        <div className={twMerge("bg-clinical-800 border border-clinical-700 rounded-xl p-4 shadow-lg", className)} {...props}>
            {title && <h3 className="text-clinical-100 font-semibold mb-4 text-lg tracking-tight">{title}</h3>}
            {children}
        </div>
    );
}
