import Link from "next/link"

export default function Tools() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-[8px]">
      <Tool title="Troll Generator"
        href="tools/create-custom"
        description="Generate troll"
      />

      <Tool title="TBA"
        href="#"
        description="To be added."
      />

      <Tool title="TBA"
        href="#"
        description="To be added."
      />

      <Tool title="TBA"
        href="#"
        description="To be added."
      />

    </div>
  )
}

function Tool({ title, description, href }: { title: string, description?: string, href: string }) {
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
