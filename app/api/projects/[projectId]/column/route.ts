import { NextRequest, NextResponse } from "next/server";
import { ColumnFull, columnWithEverything } from "../route";
import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";

export interface ColumnResponse {
  column?: ColumnFull,
  error?: string,
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  let res: ColumnResponse;

  try {
    const { title, apiKey } = await req.json();
    if (!title) throw "Where title";

    const projectId = (await params).projectId;
    if (!projectId) throw "Where projectId";

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized"

    const lastColumn = await prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const column = await prisma.column.create({
      data: {
        title,
        project: { connect: { id: projectId } },
        order: lastColumn ? lastColumn.order + 10 : 10
      },
      ...columnWithEverything
    })

    res = { column }
    return NextResponse.json(res, { status: 200 });
  } catch (e) {
    console.error(e);
    res = { error: String(e) };
    return NextResponse.json(res, { status: 400 });
  }
}
