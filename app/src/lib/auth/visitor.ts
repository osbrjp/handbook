export type Role = "editor" | "reader";

export interface Visitor {
  email: string;
  role: Role;
  groupKeys: string[]; // group keys the user belongs to — used by the content ACL
}
