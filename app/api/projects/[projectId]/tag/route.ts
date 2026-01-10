import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const projectId = (await params).projectId;
    const { name, color, apiKey } = await req.json();
    if (!projectId) throw "Where projectId";
    if (!name || !color) throw "Where args";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { members: true },
    });
    if (!project) throw "Project not found";
    if (!project.members.some(m => m.id === userData.id)) throw "No permission";

    await prisma.cardTag.create({
      data: {
        name,
        color,
        project: { connect: { id: projectId } },
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}
