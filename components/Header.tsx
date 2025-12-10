import Link from "next/link";
import MaterialIcon from "./MaterialIcon";
import { ReactNode } from "react";

export default function Header() {
  return (
    <div className="flex flex-row justify-between items-center text-center text-sm h-[75px] w-full max-w-md mx-auto px-[8px] md:px-0">
      <Link href="/" className="font-bold text-primary">
        anturated
      </Link>
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
