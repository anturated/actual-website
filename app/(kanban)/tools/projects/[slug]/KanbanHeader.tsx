import { ProjectFull } from "@/app/api/projects/[projectId]/route";
import { MaterialIcon } from "@/components/MaterialIcon";
import { UserDTO } from "@/data/user-dto";
import Image from "next/image";
import { useState } from "react";

export default function KanbanHeader({
  project,
  userData
}: {
  project?: ProjectFull,
  userData?: UserDTO
}) {
  return (
    <div
      className="flex flex-row justify-between items-center px-2 w-full h-10 bg-surface-container"
    >
      <div className="flex flex-row gap-8">
        <button>
          <MaterialIcon>menu</MaterialIcon>
        </button>
        <p>{project?.title}</p>
      </div>

      {/* right side */}
      <div className="flex flex-row gap-4">
        {/* pfps */}
        <div className="flex flex-col ">
          {project?.members && project.members.map(m => (
            <AvatarFallback userId={m.id} key={m.id} />
          ))}
        </div>
        Project Settings
      </div>
    </div>
  )
}

export function AvatarFallback({ userId }: { userId?: string }) {
  const [hasAvatar, setHasAvatar] = useState(Boolean(userId));

  const onError = () => {
    setHasAvatar(false);
  }

  return (
    <div className="relative bg-secondary w-8 h-8 rounded-full overflow-hidden">
      {hasAvatar ? (
        <Image
          src={`/api/users/avatar/${userId}`}
          alt="pfp"
          fill
          onError={onError}
        />
      ) : (
        <MaterialIcon>man</MaterialIcon>
      )}

    </div>
  )
}
