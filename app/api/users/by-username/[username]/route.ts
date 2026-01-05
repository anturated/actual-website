import { NextRequest, NextResponse } from "next/server";
import { userNoPassword } from "../../route";
import { prisma } from "@/lib/prisma";
import { UserResponse } from "../../[id]/route";


export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  let res: UserResponse;

  try {
    const username = (await params).username;

    if (!username) throw "Where username";

    const user = await prisma.user.findUnique({
      where: { username },
      ...userNoPassword
    });
    if (!user) throw "User not found";

    res = { user }

    return NextResponse.json(res);
  } catch (e) {
    console.error(e)
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }
}
