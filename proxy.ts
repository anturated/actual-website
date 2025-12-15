import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse, } from "next/server";
import { SessionData, sessionOptions } from "./lib/session";
import { prisma } from "./lib/prisma";
import { permsAllow, LOGIN_PROTECTED_ROUTES, ROLE_PROTECTED_ROUTES } from "./lib/perms";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // allow public pages
  const pathname = req.nextUrl.pathname;
  const protectedKey = Object.keys(ROLE_PROTECTED_ROUTES).find(r => pathname.startsWith(r));
  const isPublic = !LOGIN_PROTECTED_ROUTES.includes(pathname) && !protectedKey;

  if (isPublic) return res;

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const user = session.user;

  // redirect logged out users from protected pages
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // invalidate session if needed
  const firstLoad = !req.headers.get("x-next-data");
  if (firstLoad) {
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

  // restrict role-protected pages
  if (protectedKey && user.perms && !permsAllow(protectedKey, user.perms))
    return NextResponse.redirect(new URL(req.headers.get("referer") ?? "/"));

  return res;
}

export const config = {
  matcher: ["/tools/:path*"]
}
