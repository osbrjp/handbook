import type { PageMeta } from "./acl.ts";

// Parse a page file that WE serialized (serialize.ts) back into meta + body —
// used to resume a draft from its edit branch, where Astro's collection can't
// see it. This is NOT a general YAML parser: it reads exactly the format
// serializePageFile emits (JSON-quoted scalars, bare visibility/sort), and
// FAILS CLOSED — anything unexpected returns null and the caller falls back
// to the published version.

export interface ParsedPage {
  frontmatter: PageMeta;
  body: string;
}

export function parsePageFile(text: string): ParsedPage | null {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) return null;
  const [, fmBlock, rawBody] = m;

  const fields: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    if (!line.trim()) continue;
    const kv = /^([a-z_]+):\s?(.*)$/.exec(line);
    if (!kv) return null; // not our format (e.g. legacy multi-line groups)
    fields[kv[1]] = kv[2];
  }

  const str = (key: string): string | null => {
    const v = fields[key];
    if (v === undefined) return null;
    try {
      const parsed = JSON.parse(v);
      return typeof parsed === "string" ? parsed : null;
    } catch {
      return null;
    }
  };

  const title = str("title");
  const section = str("section");
  if (title === null || section === null) return null;

  const visibility = fields.visibility === "public" ? "public" : "internal"; // fail-closed tightest
  const sort = Number(fields.sort) || 0;

  return {
    frontmatter: {
      title,
      section,
      nav_label: str("nav_label") ?? "",
      // Key omitted entirely when absent (not `parent: undefined`) so parsed
      // frontmatter deep-equals authored frontmatter.
      ...(str("parent") !== null ? { parent: str("parent") ?? undefined } : {}),
      sort,
      visibility,
      updated_by: str("updated_by") ?? undefined,
      updated_at: str("updated_at") ?? undefined,
    },
    body: rawBody.replace(/^\n/, ""),
  };
}
