import { UserDTO } from "@/data/user-dto";
import { createHash } from "crypto";
import { prisma } from "./prisma";
import { Perm } from "./perms";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "./session";
import { cookies } from "next/headers";

export async function dbGetUserCredentials(apiKey?: string): Promise<UserDTO | null> {
  let res: UserDTO | null;

  if (apiKey) {
    const apiKeyHash = createHash("sha256")
      .update(apiKey)
      .digest("hex");

    const user = await prisma.user.findUnique({ where: { apiKeyHash } });
    if (!user) {
      console.error("invalid api key");
      return null;
    }

    res = {
      id: user.id,
      perms: user.perms as Perm[],
      username: user.username
    }

    return res;
  }

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  if (!session.user) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  res = {
    id: user.id,
    perms: user.perms as Perm[],
    username: user.username
  }

  return res;
}
