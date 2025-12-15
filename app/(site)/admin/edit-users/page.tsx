"use client";

import useSWR from "swr";
import { usersFetcher } from "@/lib/fetchers";
import { UserDTO } from "@/data/user-dto";
import { CustomInput } from "@/components/CustomInput";
import { ALL_PERMS, Perm } from "@/lib/perms";
import { FormEvent, useMemo, useReducer, useRef, useState } from "react";
import { CustomButton } from "@/components/CustomButton";

type UserEdit = {
  username?: string,
  addRoles?: Perm[]
  removeRoles?: Perm[]
}

export default function EditUsers() {
  const { data, isLoading, mutate } = useSWR('/api/users', usersFetcher);
  // dict of user id : edits
  const [edits, setEdits] = useState<Record<string, UserEdit>>({})

  // NOTE: the following lines are black magic
  // satan told me how to do this in a dream
  // i do not understand how this works, dont ask me

  const mergedUsers = useMemo(() => {
    if (!data?.users) return [];

    return data.users.map(u => {
      const editedRoles = new Set(u.perms);

      if (edits[u.id]) {
        edits[u.id].addRoles?.forEach(r => editedRoles.add(r))
        edits[u.id].removeRoles?.forEach(r => editedRoles.delete(r))
      }

      const perms = [...editedRoles];

      return {
        ...u,
        perms,
        __dirty: Boolean(edits[u.id]),
      }
    })
  }, [data?.users, edits]);

  const onRoleAdd = (id: string, role: Perm) => {
    setEdits(e => {
      const current = e[id] ?? {};
      return {
        ...e,
        [id]: {
          ...current,
          addRoles: [
            ...(current.addRoles ?? []),
            ...(!data?.users?.find(u => u.id === id)?.perms.includes(role) ? [role] : []),
          ],
          removeRoles: (current.removeRoles ?? []).filter(r => r !== role),
        }
      }
    })
  }

  const onRoleRemove = (id: string, role: Perm) => {
    setEdits(e => {
      const current = e[id] ?? {};
      return {
        ...e,
        [id]: {
          ...current,
          removeRoles: [
            ...(current.removeRoles ?? []),
            ...(data?.users?.find(u => u.id === id)?.perms.includes(role) ? [role] : []),
          ],
          addRoles: (current.addRoles ?? []).filter(r => r !== role)
        }
      }
    })
  }

  const onRoleClick = (id: string, role: Perm) => {
    if (!edits[id]?.removeRoles?.includes(role))
      onRoleRemove(id, role);
    else
      onRoleAdd(id, role);
  }

  const onSaveChanges = async () => {
    await Promise.all(
      Object.keys(edits).map(k => {
        const target = edits[k];
        const targetUser = mergedUsers.find(u => u.id === k);

        // skip if nothing to do
        const hasUsername = target.username !== undefined;
        const hasAdds = (target.addRoles?.length) ?? 0 >= 0;
        const hasRemoves = (target.removeRoles?.length) ?? 0 >= 0;

        if (!hasUsername && !hasAdds && !hasRemoves) return;
        // or if user got deleted i guess?
        if (!targetUser) return;

        return fetch("/api/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetUser),
        });
      })
    )

    mutate({ users: mergedUsers });
    setEdits({});
  }

  return (<>
    {isLoading &&
      <span>Loading</span>
    }

    {mergedUsers &&
      <div className="flex flex-col gap-4 w-full" >
        {
          mergedUsers.map(u => <UserListItem
            key={u.id}
            origUser={u}
            edits={edits[u.id]}
            onRoleAdd={onRoleAdd}
            onRoleClick={onRoleClick}
          />)
        }
      </div>
    }

    {data?.error &&
      <span className="text-error">{data.error}</span>
    }

    {Object.keys(edits).length > 0 &&
      <CustomButton onClick={onSaveChanges}>
        Save changes
      </CustomButton>
    }
  </>)
}

function UserListItem({
  origUser,
  edits,
  onRoleClick,
  onRoleAdd,
}: {
  origUser: UserDTO,
  edits?: UserEdit,
  onRoleClick: any,
  onRoleAdd: any,
}) {
  const addRoleRef = useRef<HTMLInputElement | null>(null);
  const roleData = useMemo(() => {
    const base = [...origUser.perms, ...(edits?.removeRoles ?? [])].map(p => ({
      perm: p,
      state: (edits?.removeRoles?.includes(p) ? "removed" : "default") as RoleState,
    }));

    const added =
      edits?.addRoles
        ?.filter(r => !origUser.perms.includes(r))
        .map(r => ({ perm: r, state: "added" as RoleState })) ?? [];

    return [...base, ...added];
  }, [origUser.perms, edits]);

  const onRoleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const perm = addRoleRef.current?.value;
    if (!perm || !ALL_PERMS.includes(perm as Perm)) {
      console.log("error here " + (perm ? "perm exists " : "") + (ALL_PERMS.includes(perm as Perm) ? "its in the thing " : ""));
      return
    }

    onRoleAdd(origUser.id, perm);

    e.currentTarget.reset();
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container p-2 rounded-xl">
      <span className="text-tertiary">
        {origUser.username}
      </span>

      <div className="flex flex-row flex-wrap gap-4">
        {roleData.map(d => <Role
          perm={d.perm}
          state={d.state}
          onClick={() => onRoleClick(origUser.id, d.perm)}
          key={d.perm}
        />)}
      </div>

      <form onSubmit={onRoleSubmit} >
        <CustomInput list="perms" ref={addRoleRef} />
        <datalist id="perms">
          {ALL_PERMS.map(p => <option value={p} key={p} />)}
        </datalist>
      </form>
    </div>
  )
}

const ROLE_STATES = ["added", "removed", "default"] as const;
type RoleState = (typeof ROLE_STATES)[number];

const ROLE_CLASS: Record<RoleState, string> = {
  added: "bg-primary text-on-primary",
  removed: "bg-error text-on-error",
  default: "bg-secondary text-on-secondary",
} as const;

function Role({ perm, state = "default", onClick }: { perm: Perm, state?: RoleState, onClick: any }) {
  const textColor = useMemo(() =>
    state === "added" ? "primary" : state === "removed" ? "error" : "secondary",
    [state]
  );

  return (
    <button
      onClick={onClick}
      className={`${ROLE_CLASS[state]} px-2 rounded-sm`}
    >
      {perm}
    </button>
  )
}
