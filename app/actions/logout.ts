"use server";

import { sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function logout() {
  const session = await getIronSession((await cookies()), sessionOptions);
  session.destroy();

  await session.save();

  redirect("/login")
}
