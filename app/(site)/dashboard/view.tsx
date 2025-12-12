"use client";

import logout from "@/app/actions/logout";
import { Tool } from "../tools/page";
import { Perm, permsAllow } from "@/lib/perms";


export default function DashboardView({ perms }: { perms: Perm[] }) {
  return <>
    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-[8px]">
      {permsAllow("/notes", perms) &&
        <Tool
          title="Notes"
          description="View notes"
          href={"/notes"}
        />
      }

      {perms.includes("admin") &&
        <Tool
          title="Edit users"
          description="View and edit user list."
          href={"/admin/edit-users"}
        />
      }
    </div>

    <button onClick={logout} className="border-2 border-primary bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary p-3 rounded-lg">
      logout
    </button >
  </>
}
