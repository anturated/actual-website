import { MeResponse } from "@/app/api/me/route";
import { Fetcher } from "swr";

export const meFetcher: Fetcher<MeResponse, string> = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  })

