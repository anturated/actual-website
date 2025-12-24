// NOTE: decided to use slugify
// for multi-language support

import slugify from "slugify";
import { prisma } from "./prisma";

export function makeSlug(title: string) {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  })
}

export async function generateUniqueSlug(title: string) {
  const base = makeSlug(title);
  let slug = base;
  let i = 1;

  // HACK: this is probably not the best practice
  // but its not like we'll get a lot of matching titles
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}

export async function generateUniqueNoteSlug(title: string) {
  const base = makeSlug(title);
  let slug = base;
  let i = 1;

  // HACK: this is probably not the best practice
  // but its not like we'll get a lot of matching titles
  while (await prisma.note.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}
