"use client"

import { BlogPostFull } from "@/app/api/blog/[postId]/route";
import { CustomButton } from "@/components/CustomButton";
import { MaterialIcon } from "@/components/MaterialIcon";
import { meFetcher } from "@/lib/fetchers";
import { BlogPost } from "@prisma/client";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import useSWR from "swr";

export default function BlogPostView({ post }: { post: BlogPostFull }) {
  const { data: userData } = useSWR("/api/me", meFetcher);
  const router = useRouter();

  const isLiked = useMemo(() => {
    return post.likes.some(l => l.userId === userData?.user?.id)
  }, [post])

  const [editing, setEditing] = useState(false);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const onSave = async () => {
    const title = titleRef.current?.value
    const text = textRef.current?.value ?? null;

    if (!title) return;

    const newPost: Partial<BlogPost> = {
      title,
      text,
    }

    const res = await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })

    if (!res.ok) return;

    router.refresh();
    setEditing(false);
  }

  const onCancel = () => {
    setEditing(false);

    if (textRef.current && post.text)
      textRef.current.value = post.text;
  }

  const onDelete = async () => {
    const res = await fetch(`/api/blog/${post.id}`, {
      method: "DELETE",
    })

    if (res.ok) redirect("/blog");
  }

  const onLike = async () => {
    let method: string;
    if (!isLiked)
      method = "PUT";
    else
      method = "DELETE";

    const response = await fetch(`/api/blog/${post.id}/like`, {
      method
    });

    if (response.ok) router.refresh();
  }

  return (<>
    <article className="flex flex-col w-full grow items-center gap-8">
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
        <textarea className={`mt-10 w-full resize-none md:text-lg grow${editing ? " bg-surface-container rounded-lg" : ""}`}
          disabled={!editing}
          defaultValue={post.text}
          ref={textRef}
        />
      }
    </article>

    {/* likes */}
    <button
      className="flex flex-row gap-4 cursor-pointer"
      onClick={onLike}
    >
      <MaterialIcon>
        thumb_up
      </MaterialIcon>
      {post.likes.length}
    </button>
  </>)
}
