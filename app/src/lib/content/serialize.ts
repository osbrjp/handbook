import type { PageMeta } from "./acl";

// Serialize a page to markdown-with-YAML-frontmatter (the on-disk / in-repo
// format the content collection reads back). Double-quoted scalars (via
// JSON.stringify) are valid YAML and safely escape colons/quotes/newlines.
function yamlScalar(s: string): string {
  return JSON.stringify(String(s));
}

export function serializePageFile(fm: PageMeta, body: string): string {
  const lines = ["---"];
  lines.push(`title: ${yamlScalar(fm.title)}`);
  lines.push(`section: ${yamlScalar(fm.section)}`);
  lines.push(`nav_label: ${yamlScalar(fm.nav_label ?? "")}`);
  if (fm.parent) lines.push(`parent: ${yamlScalar(fm.parent)}`);
  lines.push(`sort: ${Number(fm.sort) || 0}`);
  lines.push(`visibility: ${fm.visibility}`);
  if (fm.updated_by) lines.push(`updated_by: ${yamlScalar(fm.updated_by)}`);
  if (fm.updated_at) lines.push(`updated_at: ${yamlScalar(fm.updated_at)}`);
  lines.push("---");
  return `${lines.join("\n")}\n\n${body.trim()}\n`;
}

// A slug becomes a FILENAME (and a repo path), so it must be strictly safe:
// lowercase alphanumerics + hyphens only, no dots/slashes/traversal. This is
// THE path-traversal guard for every write driver — the content agent imports
// it too, so dev and prod can never drift. The runtime typeof check matters:
// the agent feeds this raw JSON payload values, and TS types vanish at runtime.
export function isSafeSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[a-z0-9][a-z0-9-]*$/.test(slug);
}
