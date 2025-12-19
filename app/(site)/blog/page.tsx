"use client"

import { BlogPostWithUser } from "@/app/api/blog/route";
import { CustomButton } from "@/components/CustomButton";
import { meFetcher, postsFetcher } from "@/lib/fetchers"
import { FormEvent, useRef } from "react";
import useSWR from "swr"

export default function Tools() {
  const { data, isLoading, mutate } = useSWR("/api/blog", postsFetcher);
  const { data: userData } = useSWR("/api/me", meFetcher)

  const sendPost = async (title: string, text: string): Promise<Boolean> => {
    if (!data?.posts || !userData?.user || !title) return false;

    const post: BlogPostWithUser = {
      id: crypto.randomUUID(),
      title,
      text,
      userId: userData.user?.id,
      created: new Date(),
      updated: new Date(),
      user: { id: userData.user.id, username: userData.user.username }
    }

    mutate({ posts: [...data.posts, post] }, false)

    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (!res.ok) return false;

    mutate();
    return true;
  }

  return (
    <div className="flex flex-col max-w-4xl gap-4 w-full">
      {userData?.user &&
        <PostForm sendPost={sendPost} />
      }

      {data?.posts && data.posts.map(p =>
        <Post key={p.id} post={p} userId={userData?.user?.id} />
      )}
    </div>
  )
}

function Post({ post, userId }: { post: BlogPostWithUser, userId?: string }) {
  return (
    <div className="flex flex-col gap-2 bg-surface-container-high rounded-2xl p-2">
      <p className="text-lg font-semibold">{post.title}</p>
      <p className="text-sm text-outline -mt-2">by {post.user.username}</p>
      <p>{post.text}</p>
    </div>
  )
}

function PostForm({ sendPost }: { sendPost: any }) {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const onPost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    const title = titleRef.current?.value;
    const text = textRef.current?.value;

    const res = await sendPost(title, text);

    if (res && target) target.reset();
  }

  return (
    <form
      className="flex flex-col rounded-2xl p-2 w-full bg-surface-container-high"
      onSubmit={onPost}
    >
      <input
        className="text-xl font-bold"
        placeholder="Post title"
        ref={titleRef}
      />
      <hr className="text-outline my-2" />
      <textarea
        // TODO: auto resize with text
        className="resize-none h-min"
        placeholder="Post body (optional)"
        ref={textRef}
      />
      <div className="flex flex-row gap-4 justify-end">
        <CustomButton className="px-8">Send</CustomButton>
      </div>
    </form>
  )
}


