export const ALL_PERMS = [
  "admin",
  "note_edit", "note_view"
] as const;

export const PROTECTED_ROUTES: string[] = ["/dashboard"]

export const ROLE_PROTECTED_ROUTES: Record<string, Perm[]> = {
  "/notes": ["note_view", "note_edit", "admin"],
  "/admin": ["note_edit"],
} as const;

export type Perm = (typeof ALL_PERMS)[number];

export function permsAllow(pathname: string, perms: Perm[]): boolean {
  return ROLE_PROTECTED_ROUTES[pathname]?.some(p => perms.includes(p)) ?? false;
}
