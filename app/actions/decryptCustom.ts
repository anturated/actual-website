"use server"

import { CustomInfo, decryptPayload } from "@/lib/crypto";

export async function decryptCustom(token: string): Promise<CustomInfo> {
  const data = decryptPayload(token);
  return data;
}
