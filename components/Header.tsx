"use server";

import Link from "next/link";
import { ReactNode } from "react";
import BreadCrumps from "./BreadCrumps";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";

export default async function Header() {
  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const user = session.user;

  return (
    <div className="flex flex-row justify-between items-center text-center text-sm h-[75px] w-full max-w-md mx-auto px-[8px] md:px-0">
      <div className="flex flex-col md:flex-row items-start">
        {/* homepage link */}
        <Link href="/" className="font-bold text-primary">
          anturated
        </Link>
        {/* breadcrumps */}
        <BreadCrumps />
      </div>
      <nav className="flex flex-row gap-[15px]">
        <HeaderLink href="/blog">
          posts
        </HeaderLink>
        <HeaderLink href="/tools">
          tools
        </HeaderLink>
        {!user ? (
          <HeaderLink href="/login">
            login
          </HeaderLink>
        ) : (
          <HeaderLink href="/dashboard">
            dash
          </HeaderLink>
        )}
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
