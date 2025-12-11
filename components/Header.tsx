"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const parts = usePathname()
    .split("/")
    .filter(Boolean);

  const crumps = parts.map((part, i) => ({
    text: decodeURIComponent(part),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }))

  return (
    <div className="flex flex-row justify-between items-center text-center text-sm h-[75px] w-full max-w-md mx-auto px-[8px] md:px-0">
      <div className="flex flex-col md:flex-row items-start">
        {/* homepage link */}
        <Link href="/" className="font-bold text-primary">
          anturated
        </Link>
        {/* breadcrumps */}
        <div className="flex flex-row">
          {
            crumps.map((c, key) => <span key={key}>
              {"/"}
              <Link href={c.href} className="text-secondary">{c.text}</Link>
            </span>)
          }
        </div>
      </div>
      <nav className="flex flex-row gap-[15px]">
        <HeaderLink href="/blog">
          posts
        </HeaderLink>
        <HeaderLink href="/tools">
          tools
        </HeaderLink>
        <HeaderLink href="/login">
          login
        </HeaderLink>
      </nav>
      {/* TODO: add theme switcher */}
      {/* <MaterialIcon> */}
      {/*   bedtime */}
      {/* </MaterialIcon> */}
    </div>
  )
}

function HeaderLink({ href, children }: { href: string, children?: ReactNode }) {
  return (
    <Link
      className="text-secondary font-semibold"
      href={href}>
      {children}
    </Link>
  )
}
