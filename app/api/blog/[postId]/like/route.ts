import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(_: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const userData = await dbGetUserCredentials();
    if (!userData) throw "Unauthorized";

    const postId = (await params).postId
    if (!postId) throw "Where post id?"

    const userId = userData.id;

    // has to be upsert to abuse unique pair
    const res = await prisma.like.upsert({
      where: {
        userId_postId: {
          userId,
          postId
        }
      },
      create: {
        userId,
        postId
      },
      update: {}
    })

    return new NextResponse(null, { status: 200 });

  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const userData = await dbGetUserCredentials();

    if (!userData) throw "Unauthorized";

    const postId = (await params).postId

    const res = await prisma.like.delete({
      where: {
        userId_postId: {
          userId: userData.id,
          postId
        }
      }
    });

    return new NextResponse(null, { status: 200 });

  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}
