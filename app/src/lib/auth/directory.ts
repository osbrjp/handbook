// The access directory — WHO may sign in, their role, and group membership.
// Git-committed config, NO database. Pre-prod this would be synced from Google
// Workspace Groups; for the POC it's a static list edited in the repo like any
// other content. This plus the git-backed pages means the app has no datastore
// at all — it's fully stateless (session identity lives in the signed cookie).

export type Role = "editor" | "reader";

export interface Group {
  key: string;
  label: string;
}

export interface DirectoryUser {
  email: string;
  role: Role;
  name?: string;
  groups?: string[]; // group keys this user belongs to (for restricted pages)
}

// Access groups a page can be restricted to (by key). None by default — the
// restricted visibility tier is supported but unused out of the box.
export const GROUPS: Group[] = [];

// Who may sign in (allow-list). Emails are matched case-insensitively.
export const USERS: DirectoryUser[] = [
  { email: "editor@osbrjp.com", role: "editor", name: "Editor" },
  { email: "reader@osbrjp.com", role: "reader", name: "Reader" },
];

const BY_EMAIL = new Map(USERS.map((u) => [u.email.toLowerCase(), u]));

/** Resolve a user by email, or null if not in the directory (fail closed). */
export function lookupUser(email: string): DirectoryUser | null {
  return BY_EMAIL.get(email.toLowerCase()) ?? null;
}

/** The group definitions (for the editor's "restricted to" checkboxes). */
export function listGroups(): Group[] {
  return GROUPS;
}
