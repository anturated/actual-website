"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiUrl } from "./editor/types";

export interface UserInfo {
  id: string,
  name?: string,
  role: number,
}

export function LoginDisplay() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>();

  useEffect(() => {
    const token = localStorage.getItem("store_token");
    if (!token) return;

    fetch(`${getApiUrl()}/api/auth/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.json())
      .then(j => setUserInfo(j));
  }, []);

  return (
    <div>
      {userInfo ? (<>
        <p>ID:{userInfo.id}</p>
        <p>NAME:{userInfo.name ?? "no name"}</p>
        <p>ROLE:{userInfo.role}</p>
      </>) : (<>
        <p>NOT LOGGED IN</p>
        <Link href="/tools/playground/login" className="text-primary underline">LOG IN</Link>
      </>
      )}
    </div>
  )
}
