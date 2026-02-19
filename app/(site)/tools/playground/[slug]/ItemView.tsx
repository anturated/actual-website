"use client"

import Image from "next/image";
import { useEffect, useMemo, useState } from "react"
import { ClientColor, ItemColorDto, ItemFullDto, PhotoDto, getApiUrl } from "../editor/types";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginDisplay, UserInfo } from "../LoginDisplay";

export default function ItemView({ slug }: { slug: string }) {
  const [item, setItem] = useState<ItemFullDto | null>()
  const [variantId, setVariantId] = useState<string | null>();
  const activeVariant = useMemo<ItemColorDto | undefined>(() => {
    return item?.colors.find(c => c.id === variantId);
  }, [variantId]);

  const [userData, setUserData] = useState<UserInfo | null>();

  useEffect(() => {
    const res = fetch(`${getApiUrl()}/api/items/by-slug/` + slug, {
      headers: { "Accept-language": "de" },
    })
      .then(r => r.json())
      .then(j => {
        const data: ItemFullDto = j;
        setItem(data);
        setVariantId(data.colors.find(c => c)?.id);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("store_token");
    if (!token) return;

    fetch(`${getApiUrl()}/api/auth/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.json())
      .then(j => setUserData(j));
  }, []);

  const onDelete = async () => {
    const token = localStorage.getItem("store_token");
    if (!token) return;

    const res = await fetch(`${getApiUrl()}/api/items/${item?.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return;

    redirect("/tools/playground");
  }

  return (<>
    <div className="w-full flex flex-row gap-2" >
      {item && activeVariant && <>
        <Photos variant={activeVariant} />

        <div className="flex flex-col gap-2 grow">
          <h1 className="text-3xl font-semibold">
            {item?.title}
            {userData?.role === 0 && <>
              <Link href={`/tools/playground/${item.slug}/edit`}>
                <MaterialIcon className="text-primary font-bold">ink_pen</MaterialIcon>
              </Link>
              <button className="text-error" onClick={onDelete}>
                <MaterialIcon>delete</MaterialIcon>
              </button>
            </>}
          </h1>

          <Variants colors={item.colors} activeVariantId={variantId} setVariantId={setVariantId} />

          <p>
            <span className={`italic ${item.newPrice !== null ? "text-outline" : "text-secondary font-semibold"}`}>
              {item.price}
            </span>

            {item.newPrice &&
              <span className={`italic font-semibold text-error`}>
                {` ${item.newPrice}`}
              </span>
            }
          </p>

          <p>Material: {item.material}</p>

          <p>{item.description}</p>

          <Sizes activeColor={activeVariant} />
          <div className="relative w-full h-100">
            <Image
              src={item.sizesPhotoUrl ?? null}
              alt="sizes photo"
              fill
            />
          </div>
        </div>
      </>}
    </div>
  </>)
}

function Photos({ variant }: { variant: ItemColorDto }) {
  const mainPhoto = useMemo<PhotoDto | undefined>(() => {
    return variant.photos.find(p => p.isMain);
  }, [variant]);

  const otherPhotos = useMemo<PhotoDto[]>(() => {
    return variant.photos.filter(p => !p.isMain);
  }, [variant]);

  return (
    <div className="flex flex-col gap-2 w-[500px]">
      {/* main photo container */}
      <div className="relative w-full h-100 rounded-2xl overflow-clip">
        <Image
          src={mainPhoto?.url ?? ""}
          alt="main photo"
          fill
        />
      </div>

      {/* the rest of the photos */}
      <div className="grid grid-cols-4 w-full gap-2">
        {otherPhotos.map(p => <div
          className="relative w-full h-30 rounded-xl overflow-clip"
          key={p.id}
        >
          <Image
            src={p.url}
            alt="photo"
            fill
          />
        </div>)}
      </div>
    </div>
  )
}

function Variants({
  colors,
  activeVariantId,
  setVariantId
}: {
  colors: ItemColorDto[],
  activeVariantId?: string | null,
  setVariantId: any,
}) {
  return (
    <div className="flex flex-row gap-2">
      {colors.map(c => (
        <button
          className="rounded-full outline-1 outline-outline w-10 h-10 text-outline"
          style={{ backgroundColor: c.colorHex }}
          onClick={() => setVariantId(c.id)}
          key={c.id}
        >
          {activeVariantId === c.id &&
            <MaterialIcon>check</MaterialIcon>
          }
        </button>
      ))
      }
    </div >
  )
}

function Sizes({ activeColor }: { activeColor?: ItemColorDto }) {
  return (
    <div>
      {activeColor && activeColor.sizes.map(s => (
        <p key={s.size}>{`${s.size}: ${s.quantity}`}</p>
      ))}
    </div>
  )
}
