import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugs";
import { BlogPost, Prisma, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export type BlogPostWithUser = Prisma.BlogPostGetPayload<{
  include: {
    user: {
      select: {
        id: true,
        username: true,
      }
    }
  }
}>

export interface BlogResponse {
  posts?: BlogPostWithUser[],
  error?: string
}

export interface PostResponse {
  post?: BlogPost,
  error?: string,
}

export async function GET(req: NextRequest) {
  let res: BlogResponse
  const params = req.nextUrl.searchParams;

  const sort = params.get("o");
  const take = Number.parseInt(params.get("t") ?? "30");
  const skip = Number.parseInt(params.get("s") ?? "0");
  const username = params.get("u");

  const posts = await prisma.blogPost.findMany({
    // TODO: add sort
    // TODO: add filter
    take: take,
    skip: skip,
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })

  res = { posts }

  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  let res: PostResponse;

  try {
    const { apiKey, title, text } = await req.json();
    const user = await dbGetUserCredentials(apiKey);

    if (!user) throw "Invalid Credentials"

    const post = await prisma.blogPost.create({
      data: {
        title,
        text,
        userId: user.id,
        slug: await generateUniqueSlug(title)
      }
    });

    res = { post }
    return NextResponse.json(res);
  } catch (e) {
    res = { error: String(e) };
    return NextResponse.json(res, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  let res: PostResponse;

  try {
    const { apiKey, id, title, text } = await req.json();

    const userData = await dbGetUserCredentials(apiKey);
    const oldPost = await prisma.blogPost.findUnique({ where: { id } });

    if (!oldPost) throw "Post not found";
    if (!userData || userData.id !== oldPost.userId) throw "Unauthorized"

    const post = await prisma.blogPost.update({
      where: { id },
      data: { title, text },
    });

    res = { post }
  } catch (e) {
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 });
  }

  return NextResponse.json(res);
}

export async function DELETE(req: NextRequest) {
  try {
    const { apiKey, id } = await req.json();

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
