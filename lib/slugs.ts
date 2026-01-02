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

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}

export async function generateUniqueNoteSlug(title: string) {
  const base = makeSlug(title);
  let slug = base;
  let i = 1;

  while (await prisma.note.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}


export async function generateUniqueProejctSlug(title: string) {
  const base = makeSlug(title);
  let slug = base;
  let i = 1;

  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}


export async function generateUniqueCardSlug(title: string, projectId: string) {
  const base = makeSlug(title);
  let slug = base;
  let i = 1;

  while (await prisma.card.findUnique({
    where: {
      projectId_slug: {
        projectId,
        slug,
      }
    }
  })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}
