import { CustomInfo, decryptPayload } from "@/lib/crypto";
import Custom from "./view";


export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const token = (await searchParams).t;

  let data: CustomInfo;

  try {
    if (Array.isArray(token)) throw "Invalid token";

    if (!token)
      data = { name: "Привет", text: "иди нахуй" };
    else
      data = decryptPayload(token);
  } catch {
    return "INVALID LINK";
  }

  return <Custom
    cname={data.name!}
    secondtext={data.text!}
  />
}
