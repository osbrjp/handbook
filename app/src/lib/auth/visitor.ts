export type Role = "editor" | "reader";

export interface Visitor {
  email: string;
  role: Role;
  groupIds: number[];
}
