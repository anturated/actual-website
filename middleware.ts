import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SessionData, sessionOptions } from "./lib/session";
import { prisma } from "./lib/prisma";
import { Perm } from "./lib/perms";

const PROTECTED_ROUTES: string[] = ["/dashboard"]
const ROLE_PROTECTED_ROUTES: Record<string, Perm[]> = {
  "/notes": ["note_view", "note_edit", "admin"]
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // allow public pages
  const pathname = req.nextUrl.pathname;
  const isPublic = !PROTECTED_ROUTES.includes(pathname);

  if (isPublic) return res;

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const user = session.user;

  // redirect logged out users from protected pages
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // invalidate session if needed
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { sessionInvalidated: true },
    });

    if (dbUser?.sessionInvalidated) {
      // update db
      await prisma.user.update({
        where: { id: user.id },
        data: { sessionInvalidated: false },
      })

      //log out
      session.destroy();
      await session.save();

      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // TODO: restrict role protected pages

  return res;
}

export const config = {
  runtime: "nodejs",
};
