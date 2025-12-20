"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { meFetcher, notesFetcher } from "@/lib/fetchers";
import { Note } from "@prisma/client";
import { FormEvent, useMemo, useRef, useState } from "react";
import useSWR from "swr"
import NoteModal from "./NoteModal";
import NoteCard from "./NoteCard";


export default function NotesView() {
  const { data, mutate } = useSWR('/api/notes', notesFetcher);
  const { data: userData } = useSWR('/api/me', meFetcher);

  const titleRef = useRef<HTMLInputElement | null>(null);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const sortedNotes = useMemo(() => {
    if (!data?.notes) return null;

    return data.notes.slice() // avoid changing the orig
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [data]);

  const addNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget;

    const title = titleRef.current?.value
    const notes = data?.notes
    const ownerId = userData?.user?.id

    if (!notes || !ownerId || !title) return

    const note = {
      id: crypto.randomUUID(),
      isPublic,
      ownerId,
      title,
      done: false,
      text: "",
    }

    // optimistic update
    mutate({ notes: [...notes, note] }, false)

    await fetch("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note)
    });

    mutate()

    if (target)
      target.reset();
  }

  const onEdit = async (note: Note) => {
    setEditingNote(note);
  }

  const onCloseEdit = async () => {
    setEditingNote(null);
  }

  const onSendEdit = async (note: Note) => {
    const notes = data?.notes;
    const ownerId = userData?.user?.id

    if (!notes || !ownerId) return;
    const newNote = { ...note, ownerId };

    mutate({ notes: notes.map(n => n.id === note.id ? newNote : n) }, false);

    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote)
    })

    await mutate()

    setEditingNote(n => {
      if (!n) return null;
      return data?.notes?.find(d => d.id === n.id) ?? null
    });
  }

  const onDelete = async (note: Note) => {
    const notes = data?.notes;

    if (!notes) return;

    // optimistic update
    mutate({ notes: notes.filter(n => n.id !== note.id) }, false);

    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note)
    });

    mutate();
  }

  return (
    <div className="relative grow w-full">

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${editingNote ? "blur-sm" : ""}`}>

        {/* send note form */}
        {userData?.user &&
          <form onSubmit={addNote} className="flex flex-col justify-between gap-4">
            <CustomInput
              placeholder="New note title"
              ref={titleRef}
            />
            <div className="grid grid-cols-2 gap-4">
              <PrivateButton
                isPublic={isPublic}
                setIsPublic={setIsPublic}
              />

              <CustomButton
                type="submit"
              >
                Add note
              </CustomButton>
            </div>
          </form>
        }

        {/* the rest of the notes */}
        {sortedNotes && sortedNotes.map(n =>
          <NoteCard
            data={n} key={n.id}
            onEdit={onEdit}
            onDelete={onDelete}
            loggedIn={Boolean(userData?.user)}
          />
        )}
      </div>

      {/* modal */}
      {editingNote &&
        <div className="absolute p-1 md:p-4 md:px-8 w-full h-full top-0 left-0" >
          <NoteModal
            note={editingNote}
            onSendEdit={onSendEdit}
            onCloseEdit={onCloseEdit}
            loggedIn={Boolean(userData?.user)}
          />
        </div>
      }
    </div>
  )
}

export function PrivateButton({ isPublic, setIsPublic }: { isPublic: Boolean, setIsPublic: any }) {
  return (
    <CustomButton
      className="min-w-[8rem] flex"
      onClick={() => setIsPublic(!isPublic)}
      type="button"
    >
      <MaterialIcon className="align-middle flex">
        {isPublic ? "visibility" : "visibility_off"}
      </MaterialIcon>
      <span className="flex-1 align-middle justify-around">{isPublic ? " Public" : " Private"}</span>
    </CustomButton>
  )
}
