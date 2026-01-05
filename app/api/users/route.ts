import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const userNoPassword = {
  select: {
    id: true,
    username: true,
    description: true,
    perms: true,
  }
} satisfies Prisma.UserDefaultArgs;
export type UserDTO = Prisma.UserGetPayload<typeof userNoPassword>;


export interface UsersResponse {
  users?: UserDTO[],
  error?: String,
}



export async function GET(req: NextRequest) {
  let res: UsersResponse;

  try {
    const users = await prisma.user.findMany({ ...userNoPassword });
    res = { users }
  } catch (e) {
    console.error(e)
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res);
}
