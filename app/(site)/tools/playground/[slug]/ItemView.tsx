"use client"

import Image from "next/image";
import { useEffect, useMemo, useState } from "react"
import { ClientColor, ItemColorDto, ItemFullDto, PhotoDto } from "../editor/types";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ItemView({ slug }: { slug: string }) {
  const [item, setItem] = useState<ItemFullDto | null>()
  const [variantId, setVariantId] = useState<string | null>();
  const activeVariant = useMemo<ItemColorDto | undefined>(() => {
    return item?.colors.find(c => c.id === variantId);
  }, [variantId]);

  useEffect(() => {
    const res = fetch("http://localhost:5000/api/items/by-slug/" + slug, {
      headers: { "Accept-language": "de" },
    })
      .then(r => r.json())
      .then(j => { setItem(j); setVariantId(j.colors.find(c => true).id) });
  }, []);

  const onDelete = async () => {
    const res = await fetch(`http://localhost:5000/api/items/${item?.id}`, {
      method: "DELETE"
    });

    if (!res.ok) return;

    redirect("/tools/playground");
  }

  return (
    <div className="w-full flex flex-row gap-2" >
      {item && activeVariant && <>
        <Photos variant={activeVariant} />

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">
            {item?.title}
            <Link href={`/tools/playground/${item.slug}/edit`}>
              <MaterialIcon className="text-primary font-bold">ink_pen</MaterialIcon>
            </Link>
            <button className="text-error" onClick={onDelete}>
              <MaterialIcon>delete</MaterialIcon>
            </button>
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
        </div>
      </>}
    </div>
  )
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
