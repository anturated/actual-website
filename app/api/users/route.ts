import { UserDTO } from "@/data/user-dto";
import { Perm } from "@/lib/perms";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export interface UsersResponse {
  users?: UserDTO[],
  error?: String,
}

export interface UserResponse {
  user?: UserDTO,
  error?: string

}

export async function GET(req: NextRequest) {
  let res: UsersResponse;

  try {
    // TODO: ccheck perms?
    const users = await prisma.user.findMany();

    res = {
      users: users.map(u => ({
        id: u.id,
        perms: u.perms as Perm[],
        username: u.username
      }))
    }
  } catch (e) {
    res = { error: String(e) }
  }

  return NextResponse.json(res);
}

export async function PATCH(req: NextRequest) {
  let res: UserResponse;

  try {
    const { id, perms, username } = await req.json();

    const user = await prisma.user.update({ where: { id }, data: { perms, username, sessionInvalidated: true } })

    res = {
      user: {
        id: user.id,
        perms: user.perms as Perm[],
        username: user.username
      }
    };
  } catch (e) {
    res = { error: String(e) };
  }

  return NextResponse.json(res);
}


