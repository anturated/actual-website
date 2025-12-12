"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BreadCrumps() {
  const parts = usePathname()
    .split("/")
    .filter(Boolean);

  const crumps = parts.map((part, i) => ({
    text: decodeURIComponent(part),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }))

  return (
    <div className="flex flex-row">
      {
        crumps.map((c, key) => <span key={key}>
          {"/"}
          <Link href={c.href} className="text-secondary">{c.text}</Link>
        </span>)
      }
    </div>
  )
}
