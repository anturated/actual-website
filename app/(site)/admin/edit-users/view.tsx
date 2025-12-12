"use client";

import { UserDTO } from "@/data/user-dto";

export default function EditUsersView({ users }: { users: UserDTO[] }) {
  return (
    <div className="flex flex-col w-full">
      {users.map((u, key) => <div className="flex flex-col md:flex-row justify-between" key={key}>
        <p>{u.username}</p>
        <p>{u.perms.join(" ")}</p>
        <p>add role placeholder</p>
      </div>)}
    </div>
  )
}
