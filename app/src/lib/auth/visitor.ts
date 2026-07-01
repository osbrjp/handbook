export type Role = "editor" | "reader";

export interface Visitor {
  email: string;
  role: Role;
  groupIds: number[]; // legacy (D1 content ACL) — removed once db/pages.ts is gone
  groupKeys: string[]; // stable group keys — used by the git-backed content ACL
}
