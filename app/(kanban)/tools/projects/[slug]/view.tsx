"use client"

import { ProjectFull } from "@/app/api/projects/[projectId]/route";
import { meFetcher, projectFetcher } from "@/lib/fetchers";
import useSWR from "swr";
import KanbanHeader from "./KanbanHeader";
import { useMemo } from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";

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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  // TODO: CARDS BOUNCE BETWEEN COLUMNS FIX IT

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
          onDragEnd={onCardMove}
        >

          <SortableContext
            items={allCards}
            strategy={rectSortingStrategy}
          >
            {project?.columns && project.columns.map(col => (
              <KanbanColumn
                column={col}
                key={col.id}
                onCardAdd={onCardAdd}
                onCardRemove={onCardRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
