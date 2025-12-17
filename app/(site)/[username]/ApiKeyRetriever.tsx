"use client";

import { CustomButton } from "@/components/CustomButton";
import { useState } from "react";



export default function ApiKeyRetriever() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  const onApiGen = async () => {
    const res = await fetch('/api/users/api-key');

    if (!res.ok) return

    const { apiKey: resApiKey } = await res.json();

    setApiKey(resApiKey);
  }

  return (
    <>
      {apiKey &&
        <p className="text-outline">
          {apiKey}
        </p>
      }

      {!apiKey &&
        <CustomButton onClick={onApiGen}>
          Regen API key
        </CustomButton>
      }
    </>
  )
}
