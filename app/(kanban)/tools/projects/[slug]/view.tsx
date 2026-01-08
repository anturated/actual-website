"use client"

import { CardFull, ColumnFull, ProjectFull } from "@/app/api/projects/[projectId]/route";
import { meFetcher, projectFetcher } from "@/lib/fetchers";
import useSWR from "swr";
import KanbanHeader from "./KanbanHeader";
import { useEffect, useMemo, useState } from "react";
import { closestCenter, DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";

function makeCardPlaceholder(): CardFull {
  return {
    id: "0",
    tags: [],
    ownerId: "",
    title: ">>",
    text: "",
    projectId: "",
    slug: "",
    columnId: "",
    order: 0
  }
}

export default function ProjectView({ defaultProject }: { defaultProject: ProjectFull }) {
  const { data, mutate } = useSWR(
    `/api/projects/${defaultProject.id}`,
    projectFetcher,
    { fallbackData: { project: defaultProject } }
  );

  const { data: userData } = useSWR("/api/me", meFetcher);

  const project = useMemo<ProjectFull | undefined>(() => {
    return data?.project;
  }, [data])

  const sensors = useSensors(
    useSensor(PointerSensor),
    // useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor),
  );

  const [columnsVisual, setColumnsVisual] = useState<ColumnFull[]>([]);

  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [overColId, setOverColId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // create placeholder when dragging
  useEffect(() => {
    if (!data.project?.columns) {
      setColumnsVisual([])
      return;
    }

    // while not dragging show normal data
    if (!overColId || overIndex === null) {
      setColumnsVisual(data.project.columns);
      return;
    }

    setColumnsVisual(data.project.columns.map(col => {
      if (col.id !== overColId)
        return col;

      const cardsWithoutActive =
        activeCardId
          ? col.cards.filter(c => c.id !== activeCardId)
          : col.cards;

      return {
        ...col,
        cards: [
          ...col.cards.slice(0, overIndex),
          makeCardPlaceholder(),
          ...col.cards.slice(overIndex),
        ],
      };
    }));
  }, [data, overIndex, overColId]);


  const onCardAdd = async (title: string, columnId: string): Promise<boolean> => {
    if (!title || !columnId) return false;
    if (!data.project || !project?.id) return false;
    const ownerId = userData?.user?.id;
    if (!ownerId) return false;

    mutate({
      project: {
        ...data.project,
        columns: data.project.columns.map(c => c.id === columnId ? {
          ...c,
          cards: [
            ...c.cards,
            {
              id: crypto.randomUUID(),
              title,
              tags: [],
              slug: "",
              ownerId,
              projectId: project.id,
              columnId,
              text: "",
              order: project.columns.find(c => c.id === columnId)?.cards.findLast(() => true)?.order ?? 0 + 10
            }]
        } : c)
      }
    }, false);

    const res = await fetch(
      `/api/projects/${project.id}/column/${columnId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tags: [],
        })
      }
    );

    await mutate();

    return res.ok;
  }

  const onCardMove = async () => {

  }

  const onCardRemove = async () => {

  }

  const onColAdd = async () => {

  }

  const onColMove = async () => {

  }

  const onColRemove = async () => {

  }

  const handleDragStart = (e: DragStartEvent) => {
    const card = e.active;
    console.log(`setting card id to ${card.id}`)
    setActiveCardId(card.id.toString());
  }

  const handleDragOver = (e: DragOverEvent) => {
    const over = e.over;
    const overData = over?.data.current;
    const card = e.active;

    if (!over || !overData || !card) return;

    console.log(`index: ${overData.index}, col: ${overData.columnId}`)
    setOverIndex(overData.index);
    setOverColId(overData.columnId);
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const over = e.over;
    const overData = over?.data.current;
    const card = e.active;

    if (!over || !overData || !card) return;

    setOverIndex(null);
    setOverColId(null);
    setActiveCardId(null);
  }

  const allCards = useMemo<string[]>(() => {
    if (!project?.columns.some(c => c.cards)) return [];

    return project.columns.flatMap(c => c.cards.map(ca => ca.id))
  }, [project])

  return (
    <div className="flex flex-col w-full relative">
      <KanbanHeader
        project={project}
        userData={userData?.user}
      />
      <div className="flex flex-row gap-4 p-4" >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >

          {/* <SortableContext */}
          {/*   items={allCards} */}
          {/*   strategy={rectSortingStrategy} */}
          {/* > */}
          {project?.columns && columnsVisual.map(col => (
            <KanbanColumn
              column={col}
              activeCardId={activeCardId}
              key={col.id}
              onCardAdd={onCardAdd}
              onCardRemove={onCardRemove}
            />
          ))}
          {/* </SortableContext> */}
        </DndContext>
      </div>
    </div>
  )
}
