
import { useDraggable } from '@dnd-kit/core';

interface DraggablePatientProps {
    id: string;
    children: React.ReactNode;
}

export function DraggablePatient({ id, children }: DraggablePatientProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? 'shadow-2xl ring-2 ring-blue-500 rounded-xl' : ''}>
            {children}
        </div>
    );
}
