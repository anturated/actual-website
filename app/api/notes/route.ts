import { dbGetUserCredentials } from "@/lib/credentials";
import { prisma } from "@/lib/prisma";
import { SessionData, sessionOptions } from "@/lib/session";
import { generateUniqueSlug } from "@/lib/slugs";
import { Note } from "@prisma/client";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export interface NotesResponse {
  notes?: Note[]
  error?: string
}

export interface NoteResponse {
  note?: Note
  error?: string
}

export async function GET(req: NextRequest) {
  let res: NotesResponse
  // some notes may be user-protected
  const session = await getIronSession<SessionData>((await cookies()), sessionOptions);
  const user = session?.user

  // this should grab both public and per-user notes
  const notes = await prisma.note.findMany({
    where: {
      OR: [
        { isPublic: true },
        ...(user?.id ? [{ ownerId: user.id }] : []), // goddamn we ugly
      ]
    }
  });

  res = { notes };

  return NextResponse.json(res);
}

export async function PUT(req: NextRequest) {
  let res: NoteResponse;

  try {
    const { ownerId, done, title, isPublic, apiKey, ...rest } = await req.json();
    const userData = await dbGetUserCredentials(apiKey);

    // check if owner is correct
    if (userData?.id !== ownerId && !userData?.perms.includes("admin")) throw "Unauthorized";

    const note = await prisma.note.create({
      data: {
        ownerId, done, title, isPublic,
        slug: generateUniqueSlug(title),
        ...rest
      }
    });

    res = { note }
  } catch (e) {
    res = { error: String(e) }
  }

  return NextResponse.json(res)
}

export async function PATCH(req: NextRequest) {
  let res: NoteResponse

  try {

    const { id, ownerId, apiKey, ...rest } = await req.json();
    const userData = await dbGetUserCredentials(apiKey);
    if (!userData) throw "Not logged in"

    // check if owner is correct
    if (userData.id !== ownerId && !userData.perms.includes("admin")) throw userData.id + " " + ownerId;

    // check if user can edit this note
    const oldNote = await prisma.note.findUnique({ where: { id } });
    if (!oldNote) throw "Note not found";

    if (oldNote.ownerId !== userData.id && !oldNote.isPublic && !userData.perms.includes("admin")) throw "Unauthorized"

    const note = await prisma.note.update({
      where: { id },
      data: { ...rest }
    });

    res = { note: note }
  } catch (e) {
    res = { error: String(e) }
  }

  return NextResponse.json(res);
}

export async function DELETE(req: NextRequest) {
  let res: NoteResponse;

  try {
    const { id } = await req.json()

    const note = await prisma.note.delete({ where: { id } })

    res = { note }
  } catch (e) {
    res = { error: String(e) }
  }

  return NextResponse.json(res);
}
