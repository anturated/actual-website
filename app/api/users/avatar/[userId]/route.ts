import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const userId = (await params).userId;

    const avatar = await prisma.avatar.findUnique({ where: { userId } });
    if (!avatar) return new NextResponse(null, { status: 404 });

    return new NextResponse(avatar.data, {
      headers: {
        "Content-Type": avatar.mimeType,
        // "Cache-Control": "public, max-age=86400",
      }
    })
  } catch (e) {
    return NextResponse.json(String(e), { status: 400 })
  }
}
