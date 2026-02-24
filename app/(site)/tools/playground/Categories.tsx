"use client"

import { useEffect, useState } from "react"
import { getApiUrl } from "./editor/types";
import Link from "next/link";

interface Category {
  id: string,
  slug: string,
  name: string,
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetch(`${getApiUrl()}/api/categories`)
      .then(r => r.json())
      .then(j => setCategories(j.items));
  }, []);

  return (
    <div className="flex flex-row justify-between w-full">
      {categories.map(c => <Link
        className="text-tertiary underline"
        href={`/tools/playground?category=${c.slug}`}
        key={c.id}
      >
        {c.name}
      </Link>)}
    </div>
  )
}
