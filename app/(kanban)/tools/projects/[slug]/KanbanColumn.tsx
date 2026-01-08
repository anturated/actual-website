import { ColumnFull } from "@/app/api/projects/[projectId]/route";
import { FormEvent, ReactNode, Ref, useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import { MaterialIcon } from "@/components/MaterialIcon";

export function KanbanColumn({
  column,
  activeCardId,
  onCardAdd,
  onCardRemove
}: {
  column: ColumnFull
  activeCardId?: string,
  onCardAdd: any,
  onCardRemove: any
}) {
  const [adding, setAdding] = useState(false);
  const newCardRef = useRef<HTMLInputElement | null>(null);
  const [defaultText, setDefaultText] = useState("");


  // autofocus new card
  useEffect(() => {
    if (adding && newCardRef.current) {
      newCardRef.current.value = defaultText;
      newCardRef.current.focus();
    }
  }, [adding])

  const onCardSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    const title = newCardRef.current?.value;

    if (!title) return;

    // hide form for optimistic update
    const ok = onCardAdd(title, column.id);
    setAdding(false);

    // restore
    if (!await ok) {
      setDefaultText(title);
      setAdding(true);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-2 bg-surface-container w-48 h-min"
    >
      {/* header */}
      <p className="mx-2">{column.title}</p>
      {/* cards container */}
      <div className="flex flex-col gap-2" >
        {column.cards && column.cards.length > 0 &&
          column.cards.map((card, index) => (
            activeCardId !== card.id ? (
              <CardContainer index={index} columnId={column.id} key={card.id} >
                <KanbanCard card={card} />
              </CardContainer>
            ) : (
              <KanbanCard card={card} />
            )
          ))
        }

        {adding &&
          <KanbanNewCard
            onSubmit={onCardSubmit}
            onBlur={() => setAdding(false)}
            ref={newCardRef}
          />
        }
      </div>
      {/* footer */}
      {
        !adding &&
        <button
          className="flex flex-row items-center gap-2 text-outline"
          onClick={() => setAdding(true)}
        >
          <MaterialIcon>add</MaterialIcon>
          add card
        </button>
      }
    </div >
  )
}

export function CardContainer({ columnId, index, children }: { columnId: string, index: number, children: ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: `${columnId}-${index}`,
    data: {
      type: 'card',
      columnId,
      index,
    },
  });

  // TODO: probably can be done without an extra div
  return (
    <div ref={setNodeRef} >
      {children}
    </div>
  )
}

export function KanbanNewCard({
  onSubmit,
  onBlur,
  ref,
}: {
  onSubmit: any,
  onBlur: any,
  ref: Ref<HTMLInputElement>
}) {
  return (
    <form onSubmit={onSubmit} className="min-w-0">
      <input
        className="min-w-0 outline-0 bg bg-surface-container-high p-2 rounded-md"
        placeholder="Card name"
        ref={ref}
        onBlur={onBlur}
      />
    </form>
  )
}
