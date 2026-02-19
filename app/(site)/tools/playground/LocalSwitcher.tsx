"use client"

import { CustomButton } from "@/components/CustomButton";
import { getApiUrl } from "./editor/types";
import { useEffect, useMemo, useState } from "react";

export function LocalSwitcher() {
  const [override, setOverride] = useState<string | null>();
  const baseUrl = useMemo(getApiUrl, [override]);

  useEffect(() => {
    setOverride(localStorage.getItem("store_api_url"));
  }, []);

  const switchEndpoint = () => {
    if (override) localStorage.removeItem("store_api_url");
    else localStorage.setItem("store_api_url", "http://localhost:5000");
    setOverride(localStorage.getItem("store_api_url"));
  }

  return (
    <div className="flex flex-col items-center">
      <p>Current base url: {baseUrl}</p>
      <CustomButton onClick={switchEndpoint}>Switch to {override ? "production" : "local"}</CustomButton>
    </div>
  )
}
