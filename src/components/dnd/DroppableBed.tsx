
import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';

interface DroppableBedProps {
    id: string; // Bed ID
    children: React.ReactNode;
    isOccupied?: boolean;
}

export function DroppableBed({ id, children, isOccupied }: DroppableBedProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
        disabled: isOccupied // Can't drop on occupied bed? Or maybe we can to swap? Let's assume can't for now.
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "transition-all duration-300 rounded-xl",
                isOver && !isOccupied ? "bg-blue-500/20 ring-2 ring-blue-400 scale-[1.02]" : ""
            )}
        >
            {children}
        </div>
    );
}
