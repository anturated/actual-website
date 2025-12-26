import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slugs";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export type BlogPostListItem = Prisma.BlogPostGetPayload<{
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
  posts?: BlogPostListItem[],
  error?: string
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
  let res: BlogResponse;

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
      },

      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res = { posts: [post] };
    return NextResponse.json(res);
  } catch (e) {
    res = { error: String(e) };
    return NextResponse.json(res, { status: 400 });
  }
}

