import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string, tagId: string }> }) {
  try {
    const { projectId, tagId } = await params;
    const { name, color, apiKey } = await req.json();
    if (!projectId) throw "Where projectId";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "Project not found";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.cardTag.update({
      where: { id: tagId },
      data: {
        name,
        color,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string, tagId: string }> }) {
  try {
    const { projectId, tagId } = await params;
    const { apiKey } = await req.json();
    if (!projectId) throw "Where projectId";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "Project not found";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.cardTag.delete({
      where: { id: tagId },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}
