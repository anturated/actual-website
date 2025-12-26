import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        id: true,
        username: true,
      }
    }
  }
}>

export interface CommentsResponse {
  comments?: CommentWithUser[]
  error?: string
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { text, apiKey } = await req.json();
    const postId = (await params).postId;

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: userData.id,
        text
      }
    })

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return new NextResponse(String(e), { status: 400 });
  }
}
