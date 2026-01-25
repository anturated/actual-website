"use client"

import Link from "next/link";
import { useEffect, useState } from "react";

interface ItemCardDto {
  article: string,
  title: string
  slug: string,

  price: number,
  newPrice?: number,

  photoUrl: string,
}

export default function Playground() {
  const [items, setItems] = useState<ItemCardDto[] | null>(null);

  useEffect(() => {
    const res = fetch("http://localhost:5000/api/items")
      .then(r => r.json())
      .then(j => setItems(j));

    console.log(items);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3 w-full" >
      {
        items && items.map(i =>
          <ItemCard item={i} key={i.article} />
        )
      }
    </div>
  )
}

function ItemCard({ item }: { item: ItemCardDto }) {
  return (
    <div className="rounded-2xl outline-2 outline-outline-variant flex flex-col p-2" >
      <Link className="text-xl font-semibold" href={`/tools/playground/${item.slug}`}>
        {item.title}
      </Link>

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
    </div>
  )
}
