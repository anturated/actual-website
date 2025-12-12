export const ALL_PERMS = [
  "admin",
  "note_edit", "note_view"
] as const;

export type Perm = (typeof ALL_PERMS)[number];
