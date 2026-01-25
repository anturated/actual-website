"use client"

import { useEffect, useState } from "react"

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
}

interface ItemSizeDto {
  size: string,
  quantity: number,
}

export default function ItemView({ slug }: { slug: string }) {
  const [item, setItem] = useState<ItemFullDto | null>()

  useEffect(() => {
    const res = fetch("http://localhost:5000/api/items/by-slug/" + slug)
      .then(r => r.json())
      .then(j => setItem(j));
  }, []);

  return (
    <div className="w-full flex flex-row gap-2" >
      {item && <>
        <Photos />

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
        </div>
      </>}
    </div>
  )
}

function Photos() {
  return (
    <div className="w-[500px] h-[600px] bg-outline-variant">

    </div>
  )
}
