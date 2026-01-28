"use client"

import Image from "next/image";
import { useEffect, useMemo, useState } from "react"

interface ItemFullDto {
  id: string,
  article: string,

  title: string,
  description: string,
  material: string,

  price: number,
  newPrice: number,

  colors: ItemColorDto[],
}

interface ItemColorDto {
  colorHex: string,
  sizes: ItemSizeDto[],
  photos: PhotoDto[],
}

interface ItemSizeDto {
  size: string,
  quantity: number,
}

interface PhotoDto {
  id: string,
  url: string,
  isMain: boolean,
}

export default function ItemView({ slug }: { slug: string }) {
  const [item, setItem] = useState<ItemFullDto | null>()

  useEffect(() => {
    const res = fetch("http://localhost:5000/api/items/by-slug/" + slug, {
      headers: { "Accept-language": "de" },
    })
      .then(r => r.json())
      .then(j => setItem(j));
  }, []);

  return (
    <div className="w-full flex flex-row gap-2" >
      {item && <>
        <Photos variant={item.colors[0]} />

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">
            {item?.title}
          </h1>

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
