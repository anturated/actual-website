import logout from "@/app/actions/logout"
import { CustomButton } from "@/components/CustomButton"
import { Perm, permsAllow } from "@/lib/perms"
import Link from "next/link"

export default function ToolsView({ perms = [] }: { perms?: Perm[] }) {
  return <>
    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-[8px]">
      <Tool title="Troll Generator"
        href="tools/create-custom"
        description="Generate troll"
      />

      {permsAllow("/notes", perms) &&
        <Tool
          title="Notes"
          description="View notes"
          href="/notes"
        />
      }

      {perms.includes("admin") &&
        <Tool
          title="Edit users"
          description="View and edit user list."
          href="/admin/edit-users"
        />
      }

    </div>
    {perms.length > 0 &&
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
