import { Card } from "@prisma/client"
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";

export function KanbanCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: card.id,
      data: {
        type: 'card',
        columnId: card.columnId,
      }
    });

  return (
    <div
      className="rounded-md bg-surface-container-high px-2 py-1"
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      <p>{card.title}</p>
    </div>
  )
}


