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

/**
 * Resolve a user by email, or null if not in the directory (fail closed).
 *
 * `extra` is an optional LOCAL-DEV-ONLY override, passed from `env.DEV_USERS`
 * (which lives in the gitignored .dev.vars, NEVER committed) — so a real
 * Workspace email can be authorized for local testing without putting it in
 * this git-committed file. Format: `email:role,email:role` (role defaults reader).
 */
export function lookupUser(email: string, extra?: string): DirectoryUser | null {
  const e = email.toLowerCase();
  const found = BY_EMAIL.get(e);
  if (found) return found;
  if (extra) {
    for (const part of extra.split(",")) {
      const [em, role] = part.split(":").map((s) => s.trim().toLowerCase());
      if (em && em === e) {
        return { email: e, role: role === "editor" ? "editor" : "reader", groups: [] };
      }
    }
  }
  return null;
}

/** The group definitions (for the editor's "restricted to" checkboxes). */
export function listGroups(): Group[] {
  return GROUPS;
}
