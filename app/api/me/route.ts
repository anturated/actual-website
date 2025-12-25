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
  try {

    const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
    const user = session?.user;

    if (!user) throw "Not logged in"

    res = { user }
  } catch (e) {
    console.error(e);
    res = { error: String(e) };
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res);
}
