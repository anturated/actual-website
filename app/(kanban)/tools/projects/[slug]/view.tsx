"use client"

import { ColumnFull, ProjectFull } from "@/app/api/projects/[projectId]/route";
import { meFetcher, projectFetcher } from "@/lib/fetchers";
import useSWR from "swr";
import KanbanHeader from "./KanbanHeader";
import { FormEvent, Ref, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@prisma/client";
import { MaterialIcon } from "@/components/MaterialIcon";

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

  return (
    <div className="flex flex-col w-full relative">
      <KanbanHeader
        project={project}
        userData={userData?.user}
      />
      <div className="flex flex-row gap-4 p-4" >
        {project?.columns && project.columns.map(col => (
          <KanbanColumn
            column={col}
            key={col.id}
            onCardAdd={onCardAdd}
            onCardRemove={onCardRemove}
          />
        ))}
      </div>
    </div>
  )
}

export function KanbanColumn({
  column,
  onCardAdd,
  onCardRemove
}: {
  column: ColumnFull
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
      <div className="flex flex-col gap-2">
        {column.cards && column.cards.length > 0 &&
          column.cards.map(card => (
            <KanbanCard card={card} key={card.id} />
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
      {!adding &&
        <button
          className="flex flex-row items-center gap-2 text-outline"
          onClick={() => setAdding(true)}
        >
          <MaterialIcon>add</MaterialIcon>
          add card
        </button>
      }
    </div>
  )
}

export function KanbanCard({ card }: { card: Card }) {
  return (
    <div className="rounded-md bg-surface-container-high px-2 py-1">
      <p>{card.title}</p>
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
