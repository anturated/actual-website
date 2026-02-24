"use client"

import { MaterialIcon } from "@/components/MaterialIcon";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoginDisplay, UserInfo } from "./LoginDisplay";
import { getApiUrl } from "./editor/types";
import { LocalSwitcher } from "./LocalSwitcher";
import Categories from "./Categories";
import { useSearchParams } from "next/navigation";

interface ItemCardDto {
  article: string,
  title: string
  slug: string,

  price: number,
  newPrice?: number,

  photoUrl: string,
}

export default function Playground() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ItemCardDto[] | null>(null);
  const [userData, setUserData] = useState<UserInfo | null>();
  const category = searchParams.get('category');

  useEffect(() => {
    const res = fetch(`${getApiUrl()}/api/items?take=10`
      + (category ? `&Category=${category}` : "")
    )
      .then(r => r.json())
      .then(j => setItems(j.items));

    console.log(items);
  }, [category]);

  useEffect(() => {
    const token = localStorage.getItem("store_token");
    if (!token) return;

    fetch(`${getApiUrl()}/api/auth/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.json())
      .then(j => setUserData(j));
  }, []);

  return (<>
    <div className="grid grid-cols-2 w-full">
      <LoginDisplay />
      <LocalSwitcher />
    </div>
    <Categories />
    <div className="grid grid-cols-3 gap-3 w-full" >
      {
        items && items.map(i =>
          <ItemCard item={i} key={i.article} />
        )
      }

      {userData?.role === 0 &&
        <Link href="/tools/playground/editor" className="flex flex-row justify-around items-center rounded-2xl bg-surface-container">
          <MaterialIcon>Add</MaterialIcon>
        </Link>
      }
    </div>
  </>)
}

function ItemCard({ item }: { item: ItemCardDto }) {
  return (
    <div className="rounded-2xl outline-2 outline-outline-variant flex flex-col p-2 gap-2" >
      <div className="relative w-full h-40 rounded-2xl overflow-clip">
        <Image
          src={item.photoUrl}
          alt={item.slug}
          fill
        />
      </div>
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
