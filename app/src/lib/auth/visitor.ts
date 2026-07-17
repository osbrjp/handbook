// Two roles, mapped from GitHub repo permission (see auth/github.ts):
//   write/maintain/admin -> "editor"  (edit, submit, AND approve+merge others'
//                                       reviews — GitHub write already allows
//                                       merging; it just blocks approving your
//                                       OWN PR, so a 2-person review still holds)
//   read collaborator    -> "reader"
export type Role = "editor" | "reader";

/** Editing/review capability. Go through this helper — never compare the role
 * string at call sites, so UI and endpoint gates can't drift. */
export function isEditorRole(role: Role | undefined | null): boolean {
  return role === "editor";
}

export interface Visitor {
  login: string; // GitHub username — no emails anywhere in the system
  role: Role; // capability ONLY (edit/approve) — reading depends solely on being signed in
}
