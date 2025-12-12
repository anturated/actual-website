"use server"

import { getIronSession } from "iron-session"
import DashboardView from "./view"
import { cookies } from "next/headers"
import { SessionData, sessionOptions } from "@/lib/session"


export default async function Dashboard() {
  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);

  if (!session.user) return "go log in";

  const perms = session.user.perms

  return <DashboardView perms={perms!} />
}
