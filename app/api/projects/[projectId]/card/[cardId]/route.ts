import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string, cardId: string }> }) {
  try {
    const { projectId, cardId } = await params;
    const { apiKey, title, text, tags } = await req.json();
    if (!projectId || cardId) throw "Where params";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "No project with given id";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.card.update({
      where: { id: cardId },
      data: {
        title,
        text,
        tags
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string, cardId: string }> }) {
  try {
    const { projectId, cardId } = await params;
    const { apiKey, title, text, tags } = await req.json();
    if (!projectId || cardId) throw "Where params";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "No project with given id";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.card.delete({
      where: { id: cardId }
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}
