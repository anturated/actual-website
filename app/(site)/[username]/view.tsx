"use client"

import { UserDTO } from "@/data/user-dto";
import Calendar from "./calendar";
import ApiKeyRetriever from "./ApiKeyRetriever";
import { CustomButton } from "@/components/CustomButton";
import { FormEvent, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { meFetcher, userFetcher } from "@/lib/fetchers";
import Image from "next/image";
import { MaterialIcon } from "@/components/MaterialIcon";


export default function ProfileView({ username }: { username: string }) {

  const { data, mutate } = useSWR(`/api/users?u=${username}`, userFetcher);

  const { data: meData } = useSWR("/api/me", meFetcher);
  const isOwner = useMemo(() => {
    if (!data?.user || !meData?.user) return false;
    return data.user.username === meData.user.username;
  }, [data, meData])

  const onSubmitAvatar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    const res = await fetch("/api/users/avatar", {
      method: "POST",
      body: new FormData(target)
    });

    if (!res.ok) {
      return;
    }

    target.reset();
  }

  const onSave = async (username: string, description: string): Promise<Boolean> => {
    if (!username || !data?.user) return false;

    const newUsername = username === data?.user?.username ? undefined : username;
    const newDescription = (!description || description === data?.user?.description) ? undefined : description;

    if (!newUsername && !newDescription) return false;

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.user.id,
        username: newUsername,
        description: newDescription,
      })
    })

    const response = await res.json()

    if (!res.ok || response.error) { console.log(response.error); return false; }

    mutate();
    return true;
  }

  return (
    // idk if i like this
    <div className="flex flex-col gap-8 w-full">

      {/* prifile + calendar */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* pfp + text info */}
        <UserDisplay username={username} user={data?.user} isOwner={isOwner} onSave={onSave} />

        {data?.user &&
          <Calendar username={data.user.username} />
        }
      </div>

      {isOwner &&
        <>
          <ApiKeyRetriever />
          <form onSubmit={onSubmitAvatar} method="POST" encType="multipart/form-data">
            <input type="file" name="avatar"
              className="bg-surface-bright"
            />
            <CustomButton>Save avatar</CustomButton>
          </form>

        </>
      }
    </div>
  )
}

function UserDisplay({ username, user, isOwner, onSave }: { username: string, user?: UserDTO, isOwner: Boolean, onSave: any }) {
  const [hasAvatar, setHasAvatar] = useState(true);
  const [editing, setEditing] = useState(false);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const onSubmitEdits = async (e: FormEvent) => {
    e.preventDefault();

    const name = nameRef.current?.value;
    const description = textRef.current?.value;

    if (!name) return;

    const res = await onSave(name, description);

    if (res) setEditing(false);
  }

  return (
    <div className="flex flex-row gap-4 md:gap-8 max-w-4xl w-full">
      {/* avatar container */}
      <div className="flex justify-around relative rounded-4xl overflow-hidden items-center w-[128px] md:w-[256px] h-[128px] md:h-[256px] bg-surface-bright">
        {user && hasAvatar &&
          <Image
            src={`/api/users/avatar/${user.id!}`}
            alt="pfp"
            className="object-cover"
            fill
            onError={() => setHasAvatar(false)}
          />
        }

        {user && !hasAvatar &&
          <MaterialIcon>accessible</MaterialIcon>
        }

      </div>

      {/* username & desc */}
      <div className="flow flex-col gap-8 grow">
        {/* display current */}
        {!editing &&
          <div className="flex flex-col gap-1 justify-start h-full">
            <p className="font-bold text-xl md:text-3xl">{username}</p>

            {user?.description &&
              <p className="italic text-xs md:text-sm text-wrap">
                {user.description}
              </p>
            }

            {isOwner &&
              <CustomButton
                className="mt-auto"
                onClick={() => setEditing(true)}
              >
                Edit info
              </CustomButton>
            }
          </div>
        }

        {/* editor */}
        {editing && user &&
          <form
            className="flex flex-col gap-1 h-full max-w-[176px]"
            onSubmit={onSubmitEdits}
          >
            <input
              className="bg-surface-container rounded-lg font-bold text-xl md:text-3xl"
              ref={nameRef}
              defaultValue={user.username}
            />

            <textarea
              className="grow resize-none italic text-xs md:text-sm text-wrap bg-surface-container rounded-lg"
              defaultValue={user.description}
              ref={textRef}
            />

            <div className="flex flex-row gap-4">
              <CustomButton type="submit">Save</CustomButton>
              <CustomButton type="button" onClick={() => setEditing(false)}>Cancel</CustomButton>
            </div>
          </form>
        }

      </div>
    </div>
  )
}
