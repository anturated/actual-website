"use server"

import { prisma } from "@/lib/prisma";


export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const slug = (await params).username;
  if (!slug) return "WHERE USERNAME"

  const decoded = decodeURIComponent(slug);
  const username = decoded.replace("@", '');

  const user = await prisma.user.findUnique({ where: { username }, select: { username: true } });

  if (!user) return "user not found";

  return (
    // idk if i like this
    <div className="w-full">

      {/* prifile + calendar */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* pfp + text info */}
        <div className="flex flex-row gap-4 md:gap-8 max-w-4xl">
          <div className="flex justify-around items-center w-[128px] md:w-[256px] h-[128px] md:h-[256px] bg-surface-bright">
            PFP PLACEHOLDER
          </div>

          <div className="flow flex-col gap-8">
            <p className="font-bold text-xl md:text-3xl">{user.username}</p>
            <p className="italic text-xs md:text-sm text-wrap">
              Description placeholder
            </p>
          </div>
        </div>


      </div>
    </div>
  )
}

