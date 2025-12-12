"use server";

import { Perm } from "@/lib/perms";
import { prisma } from "@/lib/prisma";
import { SessionData, sessionOptions } from "@/lib/session";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function login(formData: FormData) {
  const username = formData.get("username")?.toString()!;
  const password = formData.get("password")?.toString()!;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return { error: "Invalid credentials" };

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Invalid credentials" }

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  session.user = {
    id: user.id,
    username: user.username,
    perms: user.perms as Perm[]
  };
  await session.save();

  redirect("/tools");
}
