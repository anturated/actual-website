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

  const { data } = useSWR(`/api/users?u=${username}`, userFetcher);
  const { data: meData } = useSWR("/api/me", meFetcher);
  const isOwner = useMemo(() => {
    if (!data?.user || !meData?.user) return false;
    return data.user.username === meData.user.username;
  }, [data, meData])

  const avatarRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

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

  return (
    // idk if i like this
    <div className="w-full">

      {/* prifile + calendar */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* pfp + text info */}
        <UserDisplay username={username} user={data?.user} />

        {data?.user &&
          <Calendar username={data.user.username} />
        }
      </div>

      {isOwner &&
        <>
          <ApiKeyRetriever />
          <form onSubmit={onSubmitAvatar} method="POST" encType="multipart/form-data">
            <input type="file" name="avatar" ref={avatarRef}
              className="bg-surface-bright"
            />
            <CustomButton>Save avatar</CustomButton>
          </form>

        </>
      }
    </div>
  )
}

function UserDisplay({ username, user }: { username: string, user?: UserDTO }) {
  const [hasAvatar, setHasAvatar] = useState(true);

  return (
    <div className="flex flex-row gap-4 md:gap-8 max-w-4xl w-full">
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

      <div className="flow flex-col gap-8 ">
        <p className="font-bold text-xl md:text-3xl">{username}</p>
        <p className="italic text-xs md:text-sm text-wrap">
          Description placeholder
        </p>

      </div>
    </div>
  )
}
