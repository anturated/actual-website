"use client"

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { redirect } from "next/navigation";
import { useRef } from "react";
import { getApiUrl } from "../editor/types";

interface UserDto {
  token?: string,
  userId: string,
  name?: string,
  role: string,
}

export default function StoreLogin() {
  const loginRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const onLogin = async () => {
    const fd = new FormData();
    const login = loginRef.current?.value;
    const password = passwordRef.current?.value;

    if (!login || !password) return;

    fd.append("login", login);
    fd.append("password", password);

    const res = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      console.error("login failed");
      return;
    }

    const user: UserDto = await res.json();
    localStorage.setItem("store_token", user.token!);

    redirect("/tools/playground");
  }

  return (
    <div className="flex flex-col gap-2">
      <CustomInput ref={loginRef} placeholder="login" />
      <CustomInput ref={passwordRef} placeholder="password" />
      <CustomButton onClick={onLogin}>LOG IN</CustomButton>
    </div>
  )
}
