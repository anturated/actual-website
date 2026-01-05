import { prisma } from "@/lib/prisma";
import ProfileView from "./view";
import { userNoPassword } from "@/app/api/users/route";
import { notFound } from "next/navigation";

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const slug = (await params).username;
  if (!slug) return "WHERE USERNAME"

  const decoded = decodeURIComponent(slug);
  const username = decoded.replace("@", '');

  const user = await prisma.user.findUnique({
    where: { username },
    ...userNoPassword,
  })

  if (!user) notFound();

  return <ProfileView user={user} />
}
