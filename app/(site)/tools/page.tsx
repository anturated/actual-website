"use server";

import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import ToolsView from "./view";

export default async function Tools() {
  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const perms = session.user?.perms

  return <ToolsView perms={perms} />
}
