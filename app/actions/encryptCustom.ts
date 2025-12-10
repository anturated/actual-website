"use server"

import { CustomInfo, encryptPayload } from "@/lib/crypto";

export async function encryptCustom(data: CustomInfo) {
  const token = encryptPayload(data);
  return `http://localhost:3000/custom?t=${token}`;
}
