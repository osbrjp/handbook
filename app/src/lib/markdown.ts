// Markdown -> HTML render pipeline for page bodies stored as markdown in D1.
// Handles the VitePress-isms the handbook uses:
//   - ::: admonitions  -> callout components (remark-directive)
//   - [[TOC]]          -> a table of contents built from headings
//   - ```mermaid```    -> <div class="mermaid"> for client-side rendering
//
// Body is stored as markdown VERBATIM in D1; all of this happens at render time
// so the source of truth stays plain markdown (red-team R6).

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

const CALLOUTS = new Set([
  "info",
  "tip",
  "warning",
  "danger",
  "note",
  "caution",
  "important",
  "details",
]);

function textOf(nodes: any[]): string {
  return (nodes || []).map((n) => n.value || (n.children ? textOf(n.children) : "")).join("");
}

// :::type Label  ->  <div class="callout callout-type"><div class="callout-title">…</div> …</div>
function remarkCallouts() {
  return (tree: any) => {
    visit(tree, "containerDirective", (node: any) => {
      const type = CALLOUTS.has(node.name) ? node.name : "note";
      let title = type.charAt(0).toUpperCase() + type.slice(1);
      const first = node.children?.[0];
      if (first?.type === "paragraph" && first.data?.directiveLabel) {
        title = textOf(first.children) || title;
        node.children.shift();
      }
      node.data = {
        ...(node.data || {}),
        hName: "div",
        hProperties: { className: ["callout", `callout-${type}`] },
      };
      node.children.unshift({
        type: "paragraph",
        data: { hName: "div", hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: title }],
      });
    });
  };
}

// Replace a paragraph that is exactly `[[TOC]]` with a nav list of h2/h3.
function remarkToc() {
  return (tree: any) => {
    const slugger = new GithubSlugger();
    const headings: { depth: number; text: string; id: string }[] = [];
    visit(tree, "heading", (node: any) => {
      if (node.depth === 2 || node.depth === 3) {
        const text = textOf(node.children);
        headings.push({ depth: node.depth, text, id: slugger.slug(text) });
      }
    });
    // Build a NESTED list (h3s nested under their h2) so indentation is
    // structural — no reliance on a className surviving sanitization.
    // biome-ignore lint/suspicious/noExplicitAny: mdast nodes are untyped here
    const linkItem = (h: { id: string; text: string }): any => ({
      type: "listItem",
      children: [
        {
          type: "paragraph",
          children: [{ type: "link", url: `#${h.id}`, children: [{ type: "text", value: h.text }] }],
        },
      ],
    });
    // biome-ignore lint/suspicious/noExplicitAny: mdast nodes are untyped here
    const top: { item: any; subs: any[] }[] = [];
    for (const h of headings) {
      if (h.depth === 2 || top.length === 0) {
        top.push({ item: linkItem(h), subs: [] });
      } else {
        top[top.length - 1].subs.push(linkItem(h));
      }
    }
    const items = top.map(({ item, subs }) => {
      if (subs.length) item.children.push({ type: "list", ordered: false, children: subs });
      return item;
    });

    visit(tree, "paragraph", (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      if (textOf(node.children).trim() !== "[[TOC]]") return;
      parent.children[index] = {
        type: "list",
        ordered: false,
        data: { hProperties: { className: ["toc"] } },
        children: items,
      };
    });
  };
}

// <pre><code class="language-mermaid"> -> <div class="mermaid">…</div>
function rehypeMermaid() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const code = node.children?.find((c: any) => c.type === "element" && c.tagName === "code");
      const className: string[] = code?.properties?.className || [];
      if (!code || !className.includes("language-mermaid")) return;
      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: textOf(code.children) }],
      };
    });
  };
}

// VitePress writes admonitions in several shapes that remark-directive does not
// accept directly:
//   `:::info Custom Title`   `::: info Custom Title`   `::: info`   `:::info`
// remark-directive wants the name abutting the fence and the label in brackets:
//   `:::info[Custom Title]`  /  `:::info`
// Normalize opening fences so the handbook's existing content parses. The
// closing `:::` (no name) and already-bracketed labels are left untouched.
//
// NOTE: the spaced `::: type label` form is what ~18 of the 19 real handbook
// callouts use, so this must handle the optional space after the fence.
function normalizeVitepressAdmonitions(md: string): string {
  return md.replace(/^(:{3})[ \t]*([a-zA-Z]+)[ \t]*(\S.*)?$/gm, (_m, _fence, name, rest) => {
    if (!rest) return `:::${name}`;
    if (rest.startsWith("[")) return `:::${name}${rest}`; // already bracketed
    return `:::${name}[${rest.trim()}]`;
  });
}

// Sanitize schema: page bodies are authored content and rendered with set:html,
// so they MUST be sanitized to prevent stored XSS (a lower-trust editor planting
// <script> that runs in a reader's authenticated session). We extend the default
// (GitHub-safe) schema to permit the structural classes/ids our own transforms
// add — callouts, the TOC <nav>, mermaid <div>, and heading anchors — while the
// default still strips <script>, event handlers, and javascript: URLs.
// clobberPrefix:"" keeps heading ids intact so [[TOC]] anchors still match.
const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  tagNames: [...(defaultSchema.tagNames || []), "nav"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...((defaultSchema.attributes && defaultSchema.attributes["*"]) || []),
      "className",
      "id",
    ],
    // GitHub's default schema restricts class on lists to task-list values;
    // allow our own classes (e.g. the TOC) through.
    ul: ["className"],
    ol: ["className"],
    li: ["className"],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkCallouts)
  .use(remarkToc)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeMermaid)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

export function renderMarkdown(md: string): string {
  return String(processor.processSync(normalizeVitepressAdmonitions(md || "")));
}

// Extract h2/h3 headings for the "On this page" outline. Uses the same slugger
// as rehype-slug so the anchors match the rendered heading ids.
export function extractHeadings(md: string): { depth: number; text: string; id: string }[] {
  const slugger = new GithubSlugger();
  const out: { depth: number; text: string; id: string }[] = [];
  let inFence = false;
  for (const line of (md || "").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (m) {
      const text = m[2].replace(/[*_`]/g, "").trim();
      out.push({ depth: m[1].length, text, id: slugger.slug(text) });
    }
  }
  return out;
}
