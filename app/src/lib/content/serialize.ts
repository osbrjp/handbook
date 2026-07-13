import type { PageMeta } from "./acl";

// Serialize a page to markdown-with-YAML-frontmatter (the on-disk / in-repo
// format the content collection reads back). Double-quoted scalars (via
// JSON.stringify) are valid YAML and safely escape colons/quotes/newlines.
function yamlScalar(s: string): string {
  return JSON.stringify(String(s));
}

// On-disk bodies carry a leading `# H1` (doc/ files also feed the legacy
// VitePress build, which renders it as the page title); in-app bodies must not
// (layouts render <h1>{title}</h1>). This pair is the ONE boundary between the
// two shapes: strip on load (pages.ts), re-add on save (serializePageFile).
export function stripLeadingH1(body: string): string {
  return body.replace(/^\s*# [^\n]*\n+/, "");
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
  // Re-add the `# H1` the app strips on load (pages.ts): doc/ files also feed
  // the legacy VitePress build, which renders the body's H1 as the page title.
  return `${lines.join("\n")}\n\n# ${fm.title}\n\n${body.trim()}\n`;
}

// A slug becomes a FILENAME (and a repo path), so it must be strictly safe:
// lowercase alphanumerics + hyphens only, no dots/slashes/traversal. This is
// THE path-traversal guard for every write driver — the content agent imports
// it too, so dev and prod can never drift. The runtime typeof check matters:
// the agent feeds this raw JSON payload values, and TS types vanish at runtime.
export function isSafeSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[a-z0-9][a-z0-9-]*$/.test(slug);
}
