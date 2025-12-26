"use client"

import { BlogPostFull } from "@/app/api/blog/[postId]/route";
import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { MaterialIcon } from "@/components/MaterialIcon";
import { meFetcher } from "@/lib/fetchers";
import { BlogPost } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
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
  const commentRef = useRef<HTMLInputElement | null>(null);

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

  const onComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    const comment = commentRef.current?.value;
    if (!comment) return;

    const res = await fetch(`/api/blog/${post.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });

    // TODO: SWR likes and comments to avoid page reload?
    if (!res.ok) return
    router.refresh();
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


    <div className="flex flex-col gap-3 max-w-4xl w-full bg-surface-container rounded-lg p-2 items-center">
      <form onSubmit={onComment}>
        <CustomInput
          ref={commentRef}
        />
        <CustomButton>
          Send
        </CustomButton>
      </form>

      {post.comments && post.comments.map(c => (
        <div className="flex flex-col bg-surface-container-high w-full rounded-md gap-2 p-2" key={c.text}>
          <div className="flex flex-row items-center gap-2">
            {/* avatar container */}
            <div className="relative w-7 h-7 rounded-full overflow-hidden">
              <Image
                src={`/api/users/avatar/${c.user.id}`}
                alt="pfp"
                className="object-cover"
                fill
              />
            </div>
            <p className="text-outline">@{c.user.username}</p>
          </div>
          <p>{c.text}</p>
        </div>
      ))}
    </div>
  </>)
}
