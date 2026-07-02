export type Role = "editor" | "reader";

export interface Visitor {
  login: string; // GitHub username — no emails anywhere in the system
  role: Role;
  groupKeys: string[]; // group keys the user belongs to — used by the content ACL
}
