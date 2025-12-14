import { SessionData, sessionOptions, SessionUser } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface MeResponse {
  user?: SessionUser,
  error?: string
}

export async function GET(req: Request) {
  let res: MeResponse;

  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const user = session?.user;

  if (!user) res = { error: "Not logged in" };
  else res = { user }

  return NextResponse.json(res);
}
