import { BlogPostFull } from "@/app/api/blog/[postId]/route";
import { prisma } from "./prisma";

export async function getPostBySlug(slug: string): Promise<BlogPostFull | null> {
  return await prisma.blogPost.findUnique({
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

}
