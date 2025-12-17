"use server"

import { UserDTO } from "@/data/user-dto";
import { prisma } from "@/lib/prisma";
import Calendar from "./calendar";
import ApiKeyRetriever from "./ApiKeyRetriever";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";


export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const slug = (await params).username;
  if (!slug) return "WHERE USERNAME"

  const decoded = decodeURIComponent(slug);
  const username = decoded.replace("@", '');

  const user = await prisma.user.findUnique({ where: { username }, select: { username: true } });
  if (!user) return "user not found";

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const isOwner = Boolean(session.user?.username === username);

  return (
    // idk if i like this
    <div className="w-full">

      {/* prifile + calendar */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* pfp + text info */}
        <UserDisplay user={user} />

        <Calendar username={user.username} />
      </div>

      {isOwner &&
        <ApiKeyRetriever />
      }
    </div>
  )
}

function UserDisplay({ user }: { user: UserDTO }) {
  return (
    <div className="flex flex-row gap-4 md:gap-8 max-w-4xl w-full">
      <div className="flex justify-around items-center w-[128px] md:w-[256px] h-[128px] md:h-[256px] bg-surface-bright">
        PFP PLACEHOLDER
      </div>

      <div className="flow flex-col gap-8 ">
        <p className="font-bold text-xl md:text-3xl">{user.username}</p>
        <p className="italic text-xs md:text-sm text-wrap">
          Description placeholder
        </p>
      </div>
    </div>
  )
}
