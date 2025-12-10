"use server"

import { CustomInfo, encryptPayload } from "@/lib/crypto";

export async function encryptCustom(data: CustomInfo) {
  const token = encryptPayload(data);
  return `https://anturated.dev/custom?t=${token}`;
}
