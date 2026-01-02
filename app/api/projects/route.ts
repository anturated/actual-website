import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { generateUniqueProejctSlug } from "@/lib/slugs";
import { Project } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export interface ProjectsResponse {
  projects?: Project[],
  error?: string,
}


export async function GET(req: NextRequest) {
  let res: ProjectsResponse

  try {
    // unnecessary bs for possible empty body
    // (if we dont pass the api key)
    const contentType = req.headers.get("Content-Type");
    const { apiKey } = contentType?.includes("application/json") ? await req.json() : { apiKey: undefined };

    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Unauthorized";

    // only select projects the user is a member of
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            id: userData.id
          }
        }
      },
    });

    res = { projects }
    return NextResponse.json(res, { status: 200 });
  } catch (e) {
    console.error(e);
    res = { error: String(e) }
    return NextResponse.json(res, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, apiKey } = await req.json();
    const userData = await dbGetUserCredentials(apiKey);

    if (!userData) throw "Unauthorized";
    if (!title) throw "No title";

    await prisma.project.create({
      data: {
        title,
        slug: await generateUniqueProejctSlug(title),

        owner: {
          connect: { id: userData.id }
        },

        members: {
          connect: { id: userData.id }
        },

        columns: {
          create: [
            { title: "TODO", order: 10 },
            { title: "Doing", order: 20 },
            { title: "Done", order: 30 },
          ]
        },

        cardTags: {
          create: [
            { name: "bug", color: "#a0cfd2" },
            { name: "urgent", color: "#ffb4ab" },
          ]
        }
      }
    });


    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(String(e), { status: 400 })
  }
}
