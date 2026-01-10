import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { generateUniqueCardSlug } from "@/lib/slugs";
import { Card } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface CardResponse {
  card?: Card,
  error?: string,
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string, columnId: string }> }) {
  try {
    const { projectId, columnId } = await params;
    const { title, apiKey } = await req.json();

    if (!columnId || !projectId) throw "Where params";
    if (!title) throw "Where arguments";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "No project with given id";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    // const lastCol = await prisma.column.findFirst({
    //   where: { projectId },
    //   orderBy: { order: "desc" },
    //   select: { order: true }
    // });

    await prisma.column.update({
      where: { id: columnId },
      data: { title },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string, columnId: string }> }) {
  try {
    const { projectId, columnId } = await params;
    const { title, apiKey } = await req.json();

    if (!columnId || !projectId) throw "Where params";
    if (!title) throw "Where arguments";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "No project with given id";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.column.delete({
      where: { id: columnId },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}


// this creates cards
export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string, columnId: string }> }) {
  let res: CardResponse;

  try {
    const { projectId, columnId } = await params;
    const { title, tags, apiKey } = await req.json();

    if (!columnId || !projectId) throw "Where params";
    if (!title || !tags) throw "Where arguments";

    // TODO: REMOVE THIS
    if (title === "daun") throw "test error";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "No project with given id";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    const lastCard = await prisma.card.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
      select: { order: true }
    })

    const card = await prisma.card.create({
      data: {
        title,
        slug: await generateUniqueCardSlug(title, projectId),
        order: lastCard ? lastCard.order + 10 : 10,

        owner: { connect: { id: userData.id } },
        column: { connect: { id: columnId } },
        project: { connect: { id: projectId } },
      }
    })

    res = { card };
    return NextResponse.json(res, { status: 200 });
  } catch (e) {
    console.error(e);
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }
}
