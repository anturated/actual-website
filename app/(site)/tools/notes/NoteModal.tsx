import { CustomButton } from "@/components/CustomButton";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Note } from "@prisma/client";
import { useRef, useState } from "react";
import { PrivateButton } from "./page";

export default function NoteModal({ note, onSendEdit, onCloseEdit, loggedIn }: { note: Note, onCloseEdit: any, onSendEdit: any, loggedIn: Boolean }) {
  const [initialTitle] = useState(note.title);
  const [initialText] = useState(note.text ?? "");
  const titleRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [done, setDone] = useState(note.done);
  const [isPublic, setIsPublic] = useState(note.isPublic);

  const editTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimer = () => {
    if (!editTimerRef.current) return;
    clearTimeout(editTimerRef.current);
    editTimerRef.current = null;
  }

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
    onCloseEdit();
  }

  const debounceSave = (override?: Partial<Note>) => {
    clearTimer();

    editTimerRef.current = setTimeout(async () => {
      const title = titleRef.current?.value;
      const text = textRef.current?.value ?? "";

      if (!title) return;

      const newNote: Note = {
        ...note,
        title,
        text,
        done,
        isPublic,
        ...override
      }

      await onSendEdit(newNote);
    }, 1000);
  }

  const onDone = () => {
    setDone(d => !d);
    debounceSave();
  }

  return (
    <div className="flex flex-col grow gap-2 md:gap-4 p-2 md:p-4 rounded-2xl bg-surface-container outline-2 outline-outline w-full h-full" >

      <div className="flex flex-row gap-1 md:4 text-xl">
        <button
          onClick={() => {
            const newDone = !done;
            debounceSave({ done: newDone })
            setDone(newDone)
          }}
          disabled={!loggedIn}
        >
          <MaterialIcon>
            {done ? "check_box" : "check_box_outline_blank"}
          </MaterialIcon>
        </button>

        <input
          className={`grow ${loggedIn ? "hover:underline" : ""} focus:hover:no-underline decoration-outline outline-none p-2 md:p-3 rounded-lg focus:bg-surface-container-high min-w-0`}
          placeholder="Title"
          ref={titleRef}
          defaultValue={initialTitle}
          disabled={!loggedIn}
          onChange={() => debounceSave()}
        />
        {loggedIn &&
          <PrivateButton
            isPublic={isPublic}
            setIsPublic={(v: boolean) => {
              setIsPublic(v);
              debounceSave({ isPublic: v });
            }}
            small={true}
          />
        }
        <button
          className="text-error md:text-on-surface hover:text-error cursor-pointer min-w-10"
          onClick={onSave}
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
        disabled={!loggedIn}
        onChange={() => debounceSave()}
      />
    </div >
  )
}
