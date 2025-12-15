export const ALL_PERMS = [
  "admin",
  "note_edit", "note_view"
] as const;

export const LOGIN_PROTECTED_ROUTES: string[] = ["/dashboard"]

export const ROLE_PROTECTED_ROUTES: Record<string, Perm[]> = {
  "/tools/notes": ["note_view", "note_edit", "admin"],
  "/tools/edit-users": ["admin"],
} as const;

export type Perm = (typeof ALL_PERMS)[number];

export function permsAllow(pathname: string, perms: Perm[]): boolean {
  return ROLE_PROTECTED_ROUTES[pathname]?.some(p => perms.includes(p)) ?? false;
}
