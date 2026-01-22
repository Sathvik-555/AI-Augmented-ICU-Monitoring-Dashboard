import { useState } from 'react';

export type BodyPart = 'head' | 'chest' | 'abdomen' | 'limbs' | null;

interface BodyMapProps {
    onSelect: (part: BodyPart) => void;
    selectedPart: BodyPart;
}

export function BodyMap({ onSelect, selectedPart }: BodyMapProps) {
    const [hovered, setHovered] = useState<BodyPart>(null);

    const getFill = (part: BodyPart) => {
        if (selectedPart === part) return "#3b82f6"; // blue-500
        if (hovered === part) return "#1e40af"; // blue-800
        return "#334155"; // slate-700
    };

    return (
        <svg viewBox="0 0 200 400" className="w-full h-full max-h-[500px] drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle
                cx="100" cy="40" r="30"
                fill={getFill('head')}
                className="transition-colors duration-300 cursor-pointer"
                onMouseEnter={() => setHovered('head')}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect('head')}
            />
            {/* Chest */}
            <path
                d="M 50 80 Q 100 80 150 80 L 140 160 Q 100 160 60 160 Z"
                fill={getFill('chest')}
                className="transition-colors duration-300 cursor-pointer"
                onMouseEnter={() => setHovered('chest')}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect('chest')}
            />
            {/* Abdomen */}
            <path
                d="M 60 165 L 140 165 L 130 240 Q 100 250 70 240 Z"
                fill={getFill('abdomen')}
                className="transition-colors duration-300 cursor-pointer"
                onMouseEnter={() => setHovered('abdomen')}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect('abdomen')}
            />
            {/* Limbs (Arms + Legs simplified) */}
            <g
                fill={getFill('limbs')}
                className="transition-colors duration-300 cursor-pointer"
                onMouseEnter={() => setHovered('limbs')}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect('limbs')}
            >
                {/* Left Arm */}
                <rect x="20" y="80" width="25" height="120" rx="10" />
                {/* Right Arm */}
                <rect x="155" y="80" width="25" height="120" rx="10" />
                {/* Left Leg */}
                <rect x="65" y="245" width="30" height="140" rx="10" />
                {/* Right Leg */}
                <rect x="105" y="245" width="30" height="140" rx="10" />
            </g>
        </svg>
    );
}
