import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const cardWithEverything = {
  include: {
    tags: true
  }
} satisfies Prisma.CardDefaultArgs;
export type CardFull = Prisma.CardGetPayload<typeof cardWithEverything>;

export const columnWithEverything = {
  include: {
    cards: cardWithEverything,
  }
} satisfies Prisma.ColumnDefaultArgs;
export type ColumnFull = Prisma.ColumnGetPayload<typeof columnWithEverything>;

export const projectWithEverything = {
  include: {
    columns: columnWithEverything,
    members: true,
  }
} satisfies Prisma.ProjectDefaultArgs;
export type ProjectFull = Prisma.ProjectGetPayload<typeof projectWithEverything>;

export interface ProjectResponse {
  project?: ProjectFull,
  error?: string
}


export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  let res: ProjectResponse;

  try {
    const id = (await params).projectId;
    if (!id) throw "Where id";
    // unnecessary bs for possible empty body
    // (if we dont pass the api key)
    const contentType = req.headers.get("Content-Type");
    const { apiKey } = contentType?.includes("application/json") ? await req.json() : { apiKey: undefined };

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id },
      ...projectWithEverything,
    });

    if (!project) throw "Project not found";

    res = { project };
    return NextResponse.json(res, { status: 200 });

  } catch (e) {
    console.error(e);
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 })
  }
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const id = (await params).projectId;
    if (!id) throw "Where id";
    const { apiKey, title, members } = await req.json();

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id },
      select: { members: true },
    });
    if (!project) throw "Project not found";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.project.update({
      where: { id },
      data: {
        title,
        // TODO: figure out members
      }
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    try {
      const id = (await params).projectId;
      if (!id) throw "Where id";
      const { apiKey } = await req.json();

      const userData = await dbGetUserCredentials(apiKey);
      if (!userData) throw "Unauthorized";

      const project = await prisma.project.findUnique({
        where: { id },
        select: { ownerId: true },
      });
      if (!project) throw "Project not found";
      if (userData.id !== project.ownerId) throw "No permission";

      await prisma.project.delete({
        where: { id },
      });

      return new NextResponse(null, { status: 200 });
    } catch (e) {
      console.error(e);
      return new NextResponse(String(e), { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}
