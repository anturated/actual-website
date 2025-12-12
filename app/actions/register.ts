"use server";

import { prisma } from "@/lib/prisma";
import { SessionData, sessionOptions } from "@/lib/session";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function register(formData: FormData) {
  const username = formData.get("username")?.toString()!;
  const password = formData.get("password")?.toString()!;

  if (!username || !password) return { error: "Username and password can't be empty" };

  const user = await prisma.user.findUnique({ where: { username } });
  if (user) return { error: "Username taken" };

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      passwordHash
    }
  });

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  session.user = { id: newUser.id }
  await session.save();

  redirect("/dashboard");
}
