// Markdown -> HTML render pipeline for page bodies stored as markdown in
// Directus. Handles the VitePress-isms the handbook uses:
//   - ::: admonitions  -> callout components (remark-directive)
//   - [[TOC]]          -> a table of contents built from headings
//   - ```mermaid```    -> <div class="mermaid"> for client-side rendering
//
// Body is stored as markdown VERBATIM in the CMS; all of this happens at render
// time so the source of truth stays plain markdown (red-team R6).

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
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
    visit(tree, "paragraph", (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      if (textOf(node.children).trim() !== "[[TOC]]") return;
      parent.children[index] = {
        type: "list",
        ordered: false,
        data: { hName: "nav", hProperties: { className: ["toc"] } },
        children: headings.map((h) => ({
          type: "listItem",
          data: { hProperties: { className: h.depth === 3 ? ["toc-sub"] : ["toc-top"] } },
          children: [
            {
              type: "paragraph",
              children: [{ type: "link", url: `#${h.id}`, children: [{ type: "text", value: h.text }] }],
            },
          ],
        })),
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

// VitePress writes admonitions as `:::info Custom Title` (space-separated label),
// but remark-directive expects the label in brackets: `:::info[Custom Title]`.
// Convert opening fences so the handbook's existing content parses. Lines that
// are just `:::type` or the closing `:::` are left untouched.
function normalizeVitepressAdmonitions(md: string): string {
  return md.replace(
    /^(:{3})([a-zA-Z]+)[ \t]+(\S.*)$/gm,
    (_m, _fence, name, label) => `:::${name}[${label.trim()}]`,
  );
}

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
  .use(rehypeStringify, { allowDangerousHtml: true });

export function renderMarkdown(md: string): string {
  return String(processor.processSync(normalizeVitepressAdmonitions(md || "")));
}
