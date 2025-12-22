import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";


export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    select: { slug: true }
  });

  return posts.map(p => ({ slug: p.slug }));
}

export const revalidate = 60;


export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: (await params).slug },
    include: { user: true }
  })

  if (!post) notFound();

  return (
    <article className="flex flex-col w-full items-center gap-8">
      <h1 className="text-2xl md:text-4xl">{post.title}</h1>
      <Link
        href={`/@${post.user.username}`}
        className="text-outline hover:text-primary"
      >
        by {post.user.username}
      </Link>
      {post.text &&
        <textarea className="mt-10 w-full resize-none md:text-lg"
          disabled
          value={post.text}
        />
      }
    </article>
  )
}
