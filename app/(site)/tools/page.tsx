"use client";

import logout from "@/app/actions/logout"
import { CustomButton } from "@/components/CustomButton"
import { meFetcher } from "@/lib/fetchers";
import { permsAllow } from "@/lib/perms"
import Link from "next/link"
import useSWR from "swr";

export default function ToolsView() {
  const { data } = useSWR('/api/me', meFetcher);

  return <>
    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-[8px]">
      <Tool title="Troll Generator"
        href="/tools/create-custom"
        description="Generate troll"
      />

      {data?.user && <>
        {permsAllow("/tools/notes", data.user.perms) &&
          <Tool
            title="Notes"
            description="View notes"
            href="/tools/notes"
          />
        }

        {permsAllow("/admin", data.user.perms) &&
          <Tool
            title="Edit users"
            description="View and edit user list."
            href="/admin/edit-users"
          />
        }
      </>}

    </div>
    {data?.user &&
      <CustomButton onClick={logout}>
        logout
      </CustomButton >
    }
  </>
}

export function Tool({ title, description, href }: { title: string, description?: string, href: string }) {
  return (
    <div className="flex flex-col gap-[8px] outline-2 outline-outline p-[10px] rounded-2xl">
      <Link
        className="font-bold underline text-primary"
        href={href}>
        {title}
      </Link>
      <p>
        {description}
      </p>
    </div>
  )
}
