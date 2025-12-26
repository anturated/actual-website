import { NextRequest, NextResponse } from "next/server";
import { PostResponse } from "../../[postId]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  let res: PostResponse;

  try {
    const slug = (await params).slug;
    if (!slug) throw "Where slug?"

    const post = await prisma.blogPost.findUnique({
      where: { slug },
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
                username: true
              }
            }
          }
        }

      },
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
