import { UserDTO } from "@/data/user-dto";
import { dbGetUserCredentials } from "@/lib/credentials";
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
  let res: UsersResponse | UserResponse;

  try {
    const id = req.nextUrl.searchParams.get("i");
    const username = req.nextUrl.searchParams.get("u");

    if (username) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) throw "User not found";

      res = {
        user: {
          id: user.id,
          username: user.username,
          perms: user.perms as Perm[],
          description: user.description ?? undefined
        }
      }
    } else if (id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw "User not found";

      res = {
        user: {
          id: user.id,
          username: user.username,
          perms: user.perms as Perm[]
        }
      }
    } else {

      const users = await prisma.user.findMany();

      res = {
        users: users.map(u => ({
          id: u.id,
          perms: u.perms as Perm[],
          username: u.username
        }))
      }
    }
  } catch (e) {
    console.error(e)
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res);
}

export async function PATCH(req: NextRequest) {
  let res: UserResponse;

  try {
    const { id, perms, username, description, apiKey } = await req.json();
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
        sessionInvalidated: true
      }
    })

    res = {
      user: {
        id: user.id,
        perms: user.perms as Perm[],
        username: user.username
      }
    };
  } catch (e) {
    console.error(e)
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res);
}


