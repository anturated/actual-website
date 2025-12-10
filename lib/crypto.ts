import crypto from "crypto";

export interface CustomInfo {
  name?: string,
  text?: string,
}

// decode the base64 key
const key = Buffer.from(process.env.TROLL_SECRET!, "base64");

export function encryptPayload(data: object): string {
  const json = JSON.stringify(data);
  const iv = crypto.randomBytes(12); // GCM standard IV

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // combine into one buffer: iv | tag | ciphertext
  const payload = Buffer.concat([iv, tag, encrypted]);

  // base64url encode (no =, +, /)
  return payload
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decryptPayload(token: string): any {
  // decode base64url → base64
  token = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = token + "=".repeat((4 - (token.length % 4)) % 4);
  const payload = Buffer.from(padded, "base64");

  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}

