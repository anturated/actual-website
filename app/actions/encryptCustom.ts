"use server"

import { CustomInfo, encryptPayload } from "@/lib/crypto";

export async function encryptCustom(data: CustomInfo) {
  const hostname = process.env.NODE_ENV === "production" ? "anturated.dev" : "localhost:3000";

  const token = encryptPayload(data);
  return `https://${hostname}/custom?t=${token}`;
}
