"use client"

import { BlogPostWithUser, PostResponse } from "@/app/api/blog/route";
import { CustomButton } from "@/components/CustomButton";
import { meFetcher } from "@/lib/fetchers";
import { BlogPost } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";

export default function BlogPostView({ post }: { post: BlogPostWithUser }) {
  const { data: userData } = useSWR("/api/me", meFetcher);

  const [editing, setEditing] = useState(false);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const onSave = async () => {
    const title = titleRef.current?.value
    const text = textRef.current?.value ?? null;

    if (!title) return;

    const newPost: Partial<BlogPost> = {
      id: post.id,
      title,
      text,
    }

    const res = await fetch("/api/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })

    if (!res.ok) return;

    const updatedPost: PostResponse = await res.json();
    post = {
      ...post,
      ...updatedPost
    }

    if (textRef.current)
      textRef.current.value = updatedPost.post?.text ?? "";

    setEditing(false);
  }

  const onCancel = () => {
    setEditing(false);

    if (textRef.current && post.text)
      textRef.current.value = post.text;
  }

  const onDelete = async () => {
    const res = await fetch("/api/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id })
    })

    if (res.ok) redirect("/blog");
  }

  return (
    <article className="flex flex-col w-full items-center gap-8">
      <div className="text-2xl md:text-4xl text-center w-full">
        {editing ? (
          <input
            className="bg-surface-container rounded-lg w-full"
            ref={titleRef}
            defaultValue={post.title}
          />
        ) : (
          <h1>{post.title}</h1>
        )}
      </div>

      <div className="flex flex-row items-center gap-4">
        <Link
          href={`/@${post.user.username}`}
          className="text-outline hover:text-primary"
        >
          by {post.user.username}
        </Link>
        {userData?.user?.id === post.userId && <>
          {!editing ? (<>
            <CustomButton
              onClick={() => setEditing(e => !e)}
            >
              Edit post
            </CustomButton>
            <CustomButton
              onClick={onDelete}
            >
              Delete post
            </CustomButton>
          </>) : (<>
            <CustomButton
              onClick={onSave}
            >
              Save
            </CustomButton>

            <CustomButton
              onClick={onCancel}
            >
              Cancel
            </CustomButton>
          </>)}
        </>}
      </div>

      {post.text &&
        <textarea className={`mt-10 w-full resize-none md:text-lg${editing ? " bg-surface-container rounded-lg" : ""}`}
          disabled={!editing}
          defaultValue={post.text}
          ref={textRef}
        />
      }
    </article>
  )
}
