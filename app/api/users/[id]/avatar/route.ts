import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = (await params).id;
    if (!userId) throw "Where userId";

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

// TODO: consider userid?
export async function POST(req: NextRequest) {
  try {
    const user = await dbGetUserCredentials();

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!user) throw "Invalid Credentials";
    if (!file) throw "No file";

    const data = Buffer.from(await file.arrayBuffer());
    const userId = user.id;
    const mimeType = file.type;

    await prisma.avatar.upsert({
      where: { userId },
      update: { data, mimeType },
      create: { userId, data, mimeType },
    })

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    return NextResponse.json(String(e), { status: 400 });
  }
}
