// Roles map 1:1 onto GitHub repo permission levels (see auth/github.ts):
//   admin/maintain -> "admin"   (edit + review dashboard: approve & publish)
//   write          -> "editor"  (edit -> submit for review)
//   collaborator   -> "reader"
export type Role = "admin" | "editor" | "reader";

/** Editing capability — admins can do everything editors can. */
export function isEditorRole(role: Role | undefined | null): boolean {
  return role === "editor" || role === "admin";
}

/** Review capability (approve & publish). ALL role checks go through these
 * helpers — never compare role strings at call sites, so UI and endpoint
 * gates can't drift. */
export function isAdminRole(role: Role | undefined | null): boolean {
  return role === "admin";
}

export interface Visitor {
  login: string; // GitHub username — no emails anywhere in the system
  role: Role;
  groupKeys: string[]; // group keys the user belongs to — used by the content ACL
}
