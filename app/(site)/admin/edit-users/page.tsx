"use server";

import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import EditUsersView from "./view";
import { prisma } from "@/lib/prisma";
import { Perm } from "@/lib/perms";


export default async function EditUsers() {
  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const id = session.user!.id
  const user = await prisma.user.findUnique({ where: { id }, select: { perms: true } })

  if (!user?.perms.includes("admin")) return "access denied"

  const users = await prisma.user.findMany({ select: { id: true, username: true, perms: true } });
  const usersWithPerms = users.map(u => ({ ...u, perms: u.perms as Perm[] }));

  return <EditUsersView users={usersWithPerms} />
}
