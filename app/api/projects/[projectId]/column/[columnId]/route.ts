import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { generateUniqueCardSlug } from "@/lib/slugs";
import { Card } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface CardResponse {
  card?: Card,
  error?: string,
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string, columnId: string }> }) {
  let res: CardResponse;

  try {
    const columnId = (await params).columnId
    const projectId = (await params).projectId

    const { title, tags, apiKey } = await req.json();

    if (!columnId || !projectId) throw "Where params";
    if (!title || !tags) throw "Where arguments";

    if (title === "daun") throw "test error";

    const userData = await dbGetUserCredentials(apiKey);

    if (!userData) throw "Unauthorized";

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
