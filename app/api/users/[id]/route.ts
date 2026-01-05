import { NextRequest, NextResponse } from "next/server";
import { UserDTO, userNoPassword } from "../route";
import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";


export interface UserResponse {
  user?: UserDTO,
  error?: string
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let res: UserResponse;

  try {
    const id = (await params).id;
    if (!id) throw "Where id";

    const user = await prisma.user.findUnique({
      where: { id },
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let res: UserResponse;

  try {
    const id = (await params).id;
    if (!id) throw "Where id";

    const { perms, username, description, apiKey } = await req.json();
    const sessionUser = await dbGetUserCredentials(apiKey);

    if (!sessionUser) throw "Unauthorised";

    if (id !== sessionUser.id && !sessionUser.perms.includes("admin")) throw "Invalid user";
    if (perms && !sessionUser.perms.includes("admin")) throw "Can't edit perms";

    const user = await prisma.user.update({
      where: { id },
      data: {
        perms,
        username,
        description,
        sessionInvalidated: perms ? true : undefined
      },
      ...userNoPassword,
    })

    res = { user };
    return NextResponse.json(res);
  } catch (e) {
    console.error(e)
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }
}
