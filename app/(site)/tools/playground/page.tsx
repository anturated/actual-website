"use client"

import { UserResponse } from "@/app/api/users/route";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";


export default function Playground() {
  const [userData, setUserData] = useState<UserResponse | null>(null);

  useEffect(() => {
    fetch("/api/me").then(r => r.json())
      .then(res => setUserData(res));
  }, []);

  return (
    <div>
      {userData?.user && userData.user.perms.includes("admin") &&
        <div>
          YOU ARE ADMIN
        </div>}
    </div>
  )
}
