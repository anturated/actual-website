"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { meFetcher, notesFetcher } from "@/lib/fetchers";
import { Note } from "@prisma/client";
import { useMemo, useRef, useState } from "react";
import useSWR from "swr"

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

  const addNote = async () => {
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

    mutate({ notes: notes.map(n => n.id === note.id ? { ...note, ownerId } : n) }, false);

    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note)
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
        <div className="flex flex-col justify-between gap-4">
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
              onClick={addNote}
            >
              Add note
            </CustomButton>
          </div>
        </div>

        {sortedNotes && sortedNotes.map((n, key) =>
          <NoteCard
            data={n} key={key}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      {editingNote &&
        <div className="absolute p-4 md:px-8 w-full h-full top-0 left-0" >
          <NoteModal
            note={editingNote}
            onSendEdit={onSendEdit}
            onCloseEdit={onCloseEdit}
          />
        </div>
      }
    </div>
  )
}

function NoteModal({ note, onSendEdit, onCloseEdit }: { note: Note, onCloseEdit: any, onSendEdit: any }) {
  const [initialTitle, setInitialTitle] = useState(note.title);
  const [initialText, setInitialText] = useState(note.text ?? "");
  const titleRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [done, setDone] = useState(note.done);
  const [isPublic, setIsPublic] = useState(note.isPublic);

  const onSave = () => {
    const title = titleRef.current?.value;
    const text = textRef.current?.value ?? "";

    if (!title) return;

    const newNote: Note = {
      ...note,
      title,
      text,
      done,
      isPublic,
    }

    onSendEdit(newNote);
  }

  return (
    <div className="flex flex-col grow gap-4 p-4 rounded-2xl bg-surface-container outline-2 outline-outline w-full h-full" >

      <div className="flex flex-row gap-1 md:4 text-xl">
        <button onClick={() => setDone(!done)}>
          <MaterialIcon>
            {done ? "check_box" : "check_box_outline_blank"}
          </MaterialIcon>
        </button>

        <input
          className="grow hover:underline focus:hover:no-underline decoration-outline outline-none p-3 rounded-lg focus:bg-surface-container-high min-w-0"
          placeholder="Title"
          ref={titleRef}
          defaultValue={initialTitle}
        />
        <button
          className="text-error md:text-on-surface hover:text-error cursor-pointer"
          onClick={onCloseEdit}
        >
          <MaterialIcon>
            close
          </MaterialIcon>
        </button>
      </div>

      <textarea
        className="resize-none min-h-70 h-full p-3 outline-none border-2 border-outline-variant focus:border-outline rounded-lg"
        placeholder="Note text"
        ref={textRef}
        defaultValue={initialText}
      />

      <div className="flex flex-row justify-between md:justify-end gap-3">
        <PrivateButton
          isPublic={isPublic}
          setIsPublic={setIsPublic}
        />
        <CustomButton onClick={onSave} className="px-8">
          Save
        </CustomButton>
      </div>
    </div>
  )
}

function NoteCard({ data, onEdit, onDelete }: { data: Note, onEdit: any, onDelete: any }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`
        flex items-center justify-around relative
        outline-2 outline-outline-variant bg-surface-container
        text-on-surface text-sm
        rounded-lg h-28
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="text-outline blur-sm outline-surface-container-low max-h-28 text-wrap overflow-hidden">
        {data.text}
      </p>

      <p className="absolute top-0 left-0 m-2 text-wrap">
        {data.title}
      </p>

      <MaterialIcon className="absolute bottom-0 left-0 m-2 text-outline">
        {data.isPublic ? "visibility" : "visibility_off"}
      </MaterialIcon>

      {hovered && <div className="flex flex-row text-sm absolute right-0 top-0 m-2 gap-2">
        <button onClick={() => onEdit(data)}>
          <MaterialIcon className="text-secondary md:text-secondary-container hover:text-secondary cursor-pointer">edit</MaterialIcon>
        </button>
        <button onClick={() => onDelete(data)}>
          <MaterialIcon className="text-error md:text-error-container hover:text-error cursor-pointer">delete</MaterialIcon>
        </button>
      </div>}
    </div >
  )
}

function PrivateButton({ isPublic, setIsPublic }: { isPublic: Boolean, setIsPublic: any }) {
  return (
    <CustomButton
      className="min-w-[8rem] flex"
      onClick={() => setIsPublic(!isPublic)}
    >
      <MaterialIcon className="align-middle flex">
        {isPublic ? "visibility" : "visibility_off"}
      </MaterialIcon>
      <span className="flex-1 align-middle justify-around">{isPublic ? " Public" : " Private"}</span>
    </CustomButton>
  )
}
