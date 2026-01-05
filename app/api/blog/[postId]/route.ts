import { dbGetUserCredentials } from "@/lib/credentials"
import { prisma } from "@/lib/prisma"
import { BlogPost, Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export const blogPostWithEverything = {
  include: {
    user: {
      select: {
        id: true,
        username: true,
      }
    },

    likes: true,

    comments: {
      select: {
        text: true,

        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    }

  }
} satisfies Prisma.BlogPostDefaultArgs;
export type BlogPostFull = Prisma.BlogPostGetPayload<typeof blogPostWithEverything>

export interface PostResponse {
  post?: BlogPostFull,
  error?: string,
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  let res: PostResponse;

  try {
    const id = (await params).postId;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      ...blogPostWithEverything,
    });

    if (!post) throw "Post not found";

    res = { post };
  } catch (e) {
    console.error(e);
    res = { error: String(e) };
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res, { status: 200 });
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  let res: PostResponse;

  try {
    const { apiKey, title, text } = await req.json();
    const id = (await params).postId;

    const userData = await dbGetUserCredentials(apiKey);
    const oldPost = await prisma.blogPost.findUnique({ where: { id } });

    if (!oldPost) throw "Post not found";
    if (!userData || userData.id !== oldPost.userId) throw "Unauthorized"

    const post = await prisma.blogPost.update({
      where: { id },
      data: { title, text },
      ...blogPostWithEverything,
    });

    res = { post }
  } catch (e) {
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res);
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    // unnecessary bs for possible empty body
    // (if we dont pass the api key)
    const contentType = req.headers.get("Content-Type");
    const { apiKey } = contentType?.includes("application/json") ? await req.json() : { apiKey: undefined };

    const id = (await params).postId;

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized"

    const post = await prisma.blogPost.delete({
      where: { id }
    }).catch(() => {
      throw "Post not found"
    })
  } catch (e) {
    return NextResponse.json(String(e), { status: 400 });
  }

  return new NextResponse(null, { status: 200 });
}

