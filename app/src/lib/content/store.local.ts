import type { ContentStore, PageFile, WriteOpts } from "./store";
import { serializePageFile } from "./serialize";

// Dev driver. The workerd SSR runtime can't touch the filesystem, so instead of
// writing files itself it POSTs to the local "content agent" — a Node process
// (scripts/content-agent.mjs) that does the actual file write + git commit.
// `fetch` works in workerd; the agent binds to 127.0.0.1 and checks a shared
// token. In production this driver is not used (the GitHub driver is).
export function createLocalStore(baseUrl: string, token: string): ContentStore {
  async function call(op: "write" | "rename" | "remove", payload: Record<string, unknown>) {
    const res = await fetch(`${baseUrl}/${op}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-agent-token": token },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`content-agent ${op} ${res.status}: ${detail}`);
    }
  }
  return {
    async write(file: PageFile, opts: WriteOpts) {
      await call("write", {
        slug: file.slug,
        title: file.frontmatter.title,
        text: serializePageFile(file.frontmatter, file.body),
        editor: opts.editor,
        message: opts.message,
      });
    },
    async rename(oldSlug: string, file: PageFile, opts: WriteOpts) {
      await call("rename", {
        slug: file.slug,
        oldSlug,
        title: file.frontmatter.title,
        text: serializePageFile(file.frontmatter, file.body),
        editor: opts.editor,
        message: opts.message,
      });
    },
    async remove(slug: string, opts: WriteOpts) {
      await call("remove", { slug, editor: opts.editor, message: opts.message });
    },
  };
}
