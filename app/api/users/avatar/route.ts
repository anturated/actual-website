import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


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
