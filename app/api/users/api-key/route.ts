import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

interface ApiKeyResponse {
  apiKey?: string,
  error?: string
}

// generates user api key
export async function GET(req: NextRequest) {
  let res: ApiKeyResponse;
  try {

    const user = await dbGetUserCredentials();
    if (!user) throw "Invalid credentials"

    const apiKey = "ak_" + randomBytes(32).toString("hex");
    const apiKeyHash = createHash("sha256")
      .update(apiKey)
      .digest("hex");

    await prisma.user.update({
      where: { username: user.username },
      data: { apiKeyHash }
    })

    res = { apiKey: apiKey }

    return NextResponse.json(res, { status: 200 });
  } catch (e) {
    res = { error: String(e) }
    return NextResponse.json(res, { status: 401 });
  }
}
