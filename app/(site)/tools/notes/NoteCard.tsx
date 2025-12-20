import { MaterialIcon } from "@/components/MaterialIcon";
import { Note } from "@prisma/client";
import { useState } from "react";

export default function NoteCard({ data, onEdit, onDelete, loggedIn }: { data: Note, onEdit: any, onDelete: any, loggedIn: boolean }) {
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
      <p className="text-outline blur-sm outline-surface-container-low max-h-28 text-wrap overflow-hidden select-none">
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
        {loggedIn &&
          <button onClick={() => onDelete(data)}>
            <MaterialIcon className="text-error md:text-error-container hover:text-error cursor-pointer">delete</MaterialIcon>
          </button>
        }
      </div>}
    </div >
  )
}

