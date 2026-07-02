// Access groups the `restricted` visibility tier can gate on. None are defined
// yet — the tier is supported by the schema/ACL but unused. When it's needed,
// the natural mapping is GitHub TEAMS (resolve a visitor's team memberships in
// github.ts alongside the role check) so access management stays entirely in
// GitHub, with no list committed here.

export interface Group {
  key: string;
  label: string;
}

export const GROUPS: Group[] = [];

/** The group definitions (for the editor's "restricted to" checkboxes). */
export function listGroups(): Group[] {
  return GROUPS;
}
