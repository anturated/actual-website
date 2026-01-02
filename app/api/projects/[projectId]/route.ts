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
