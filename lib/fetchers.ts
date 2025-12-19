import { BlogResponse } from "@/app/api/blog/route";
import { MeResponse } from "@/app/api/me/route";
import { NotesResponse } from "@/app/api/notes/route";
import { WorkHoursResponse } from "@/app/api/users/calendar/route";
import { UsersResponse } from "@/app/api/users/route";
import { Fetcher } from "swr";

export const meFetcher: Fetcher<MeResponse, string> = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  })

export const notesFetcher: Fetcher<NotesResponse, string> = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("Fetch failed")
    return r.json()
  })


export const usersFetcher: Fetcher<UsersResponse, string> = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("Fetch failed")
    return r.json()
  })

export const calendarFetcher: Fetcher<WorkHoursResponse, string> = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("Fetch failed")
    return r.json()
  })

export const postsFetcher: Fetcher<BlogResponse, string> = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error("Fetch failed")
    return r.json()
  })
