"use server"

import ItemView from "./ItemView";

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  return <ItemView slug={slug} />
}
