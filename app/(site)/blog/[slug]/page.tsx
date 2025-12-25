import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogPostView from "./view";


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

  return <BlogPostView post={post} />
}
