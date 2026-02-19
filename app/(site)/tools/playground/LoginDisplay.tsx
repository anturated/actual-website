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

  const fetchUserData = () => {
    const token = localStorage.getItem("store_token");
    if (!token) {
      setUserInfo(null);
      return;
    }

    fetch(`${getApiUrl()}/api/auth/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    }).then(r => r.json())
      .then(j => setUserInfo(j));
  }

  useEffect(fetchUserData, []);

  return (
    <div className="flex flex-col items-center">
      {userInfo ? (<>
        <p>NAME:{userInfo.name ?? "no name"}</p>
        <p>ROLE:{userInfo.role}</p>
        <button
          className="text-primary underline"
          onClick={() => { localStorage.removeItem("store_token"); fetchUserData() }}
        >LOG OUT</button>
      </>) : (<>
        <p>NOT LOGGED IN</p>
        <Link href="/tools/playground/login" className="text-primary underline">LOG IN</Link>
      </>
      )}
    </div>
  )
}
