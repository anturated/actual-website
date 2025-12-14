"use client";

import Link from "next/link";
import { ReactNode } from "react";
import BreadCrumps from "./BreadCrumps";
import useSWR, { Fetcher } from "swr";
import { MeResponse } from "@/app/api/me/route";

export default function Header() {
  return (
    <div className="flex flex-row justify-between items-center text-center text-sm h-[75px] w-full max-w-md mx-auto px-[8px] md:px-0">

      <div className="flex flex-col md:flex-row items-start">
        <Link href="/" className="font-bold text-primary">
          anturated
        </Link>
        <BreadCrumps />
      </div>

      <nav className="flex flex-row gap-[15px]">
        <HeaderLink href="/blog">
          posts
        </HeaderLink>
        <HeaderLink href="/tools">
          tools
        </HeaderLink>

        <LoginButton />
      </nav>

      {/* TODO: add theme switcher */}
      {/* <MaterialIcon> */}
      {/*   bedtime */}
      {/* </MaterialIcon> */}
    </div>
  )
}

function LoginButton() {
  const fetcher: Fetcher<MeResponse, string> = (url: string) =>
    fetch(url).then(r => {
      if (!r.ok) throw new Error("fetch failed");
      return r.json();
    })

  const { data } = useSWR('/api/me', fetcher);

  return data?.user ? (

    <HeaderLink href="#" >
      {data.user.username}
    </HeaderLink>
  ) : (

    <HeaderLink href="/login">
      login
    </HeaderLink>
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
