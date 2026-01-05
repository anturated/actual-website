import { createHash } from "crypto";
import { prisma } from "./prisma";
import { Perm } from "./perms";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "./session";
import { cookies } from "next/headers";
import { UserDTO, userNoPassword } from "@/app/api/users/route";


export async function dbGetUserCredentials(apiKey?: string): Promise<UserDTO | null> {
  if (apiKey) {
    const apiKeyHash = createHash("sha256")
      .update(apiKey)
      .digest("hex");

    const user = await prisma.user.findUnique({
      where: { apiKeyHash },
      ...userNoPassword
    });

    if (!user) {
      console.error("invalid api key");
      return null;
    }

    return user;
  }

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  if (!session.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    ...userNoPassword
  });
  if (!user) return null;

  return user;
}
