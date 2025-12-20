import { CustomButton } from "@/components/CustomButton";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Note } from "@prisma/client";
import { useRef, useState } from "react";
import { PrivateButton } from "./page";

export default function NoteModal({ note, onSendEdit, onCloseEdit }: { note: Note, onCloseEdit: any, onSendEdit: any }) {
  const [initialTitle] = useState(note.title);
  const [initialText] = useState(note.text ?? "");
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
    <div className="flex flex-col grow gap-2 md:gap-4 p-2 md:p-4 rounded-2xl bg-surface-container outline-2 outline-outline w-full h-full" >

      <div className="flex flex-row gap-1 md:4 text-xl">
        <button onClick={() => setDone(!done)}>
          <MaterialIcon>
            {done ? "check_box" : "check_box_outline_blank"}
          </MaterialIcon>
        </button>

        <input
          className="grow hover:underline focus:hover:no-underline decoration-outline outline-none p-2 md:p-3 rounded-lg focus:bg-surface-container-high min-w-0"
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
