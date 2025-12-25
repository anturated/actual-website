import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { WorkHours } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export interface WorkHoursResponse {
  workHours?: WorkHours[],
  error?: string
}

export async function GET(req: NextRequest) {
  let res: WorkHoursResponse;

  const username = req.nextUrl.searchParams.get("u");
  const month = req.nextUrl.searchParams.get("m");
  const year = req.nextUrl.searchParams.get("y");

  if (!username || !month || !year) return

  const start = new Date(Date.UTC(Number.parseInt(year), Number.parseInt(month) - 1, 1))
  const end = new Date(Date.UTC(Number.parseInt(year), Number.parseInt(month), 1))

  console.log(`>>> GETTING WORK FOR [${start}] - [${end}]`);

  const workHours = await prisma.workHours.findMany({
    where: {
      user: { username },
      date: {
        gte: start,
        lt: end,
      },
    },
  })

  res = { workHours }

  return NextResponse.json(res);
}

export async function PUT(req: NextRequest) {
  const { apiKey, year, month, day, seconds } = await req.json()

  if (!year || !month || !day || !seconds) return;

  const user = await dbGetUserCredentials(apiKey);
  if (!user) return NextResponse.json("Invalid credentials", { status: 400 });

  const userId = user.id;

  const date = new Date(Date.UTC(year, month - 1, day));

  await prisma.workHours.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, seconds },
    update: { seconds },
  })

  return NextResponse.json("ok", { status: 200 });
}
