#!/usr/bin/env node
// content-agent.mjs — LOCAL DEV ONLY. A tiny Node HTTP server the in-browser
// editor calls (via fetch, from the workerd SSR) to persist content, because
// workerd itself can't touch the filesystem. It writes the markdown file under
// src/content/pages and makes a git commit. Run it alongside `astro dev`
// (see `pnpm content:agent` / `pnpm dev:edit`).
//
// Safety: binds to 127.0.0.1 only, requires a shared token header
// (x-agent-token), and validates the slug (no path traversal). The real
// editor/CSRF gate lives upstream in the workerd /edit-pages/save handler; this
// agent is an internal dev helper.

import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url)); // app/scripts
const appDir = path.resolve(here, ".."); // app
const repoRoot = path.resolve(appDir, ".."); // repo root (where .git lives)
const CONTENT_REL = "app/src/content/pages";

const PORT = Number(process.env.CONTENT_AGENT_PORT || 4322);
const TOKEN = process.env.CONTENT_AGENT_TOKEN || "dev-agent";
const isSafeSlug = (s) => typeof s === "string" && /^[a-z0-9][a-z0-9-]*$/.test(s);

async function git(args) {
  await exec("git", args, { cwd: repoRoot });
}
async function stagedHasChanges(paths) {
  // `git diff --cached --quiet -- <paths>` exits 0 when nothing is staged for
  // those paths, non-zero when there are staged changes (execFile throws then).
  try {
    await git(["diff", "--cached", "--quiet", "--", ...paths]);
    return false;
  } catch {
    return true;
  }
}
async function commit(paths, message, editorEmail) {
  // No-op (e.g. deleting an already-absent file, or a save with no change): skip
  // so we don't fail with "nothing to commit". Scope the commit to `paths` so a
  // concurrent unrelated staged change can't be swept into this commit.
  if (!(await stagedHasChanges(paths))) return;
  await git([
    "commit",
    "-m",
    `${message}\n\nEdited-by: ${editorEmail || "unknown"}`,
    "--author",
    "OSBR Handbook <handbook@osbrjp.com>",
    "--",
    ...paths,
  ]);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => {
      d += c;
      if (d.length > 512 * 1024) reject(new Error("body too large"));
    });
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };
  try {
    if (req.method !== "POST") return send(405, { error: "method not allowed" });
    if (req.headers["x-agent-token"] !== TOKEN) return send(401, { error: "bad token" });

    const op = new URL(req.url, "http://localhost").pathname.replace(/^\//, "");
    const p = JSON.parse((await readBody(req)) || "{}");
    const { slug, oldSlug, text, title, editorEmail, message } = p;
    if (!isSafeSlug(slug)) return send(400, { error: "invalid slug" });

    const rel = `${CONTENT_REL}/${slug}.md`;
    const abs = path.join(repoRoot, rel);

    if (op === "write" || op === "rename") {
      if (typeof text !== "string") return send(400, { error: "missing text" });
      // Validate everything BEFORE writing, so a bad oldSlug can't orphan a file.
      const doRename = op === "rename" && oldSlug && oldSlug !== slug;
      if (doRename && !isSafeSlug(oldSlug)) return send(400, { error: "invalid oldSlug" });
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, text);
      const paths = [rel];
      if (doRename) {
        const oldRel = `${CONTENT_REL}/${oldSlug}.md`;
        await rm(path.join(repoRoot, oldRel), { force: true });
        paths.unshift(oldRel); // staging the removed path records the delete
      }
      await git(["add", "--", ...paths]);
      await commit(paths, message || `Save "${title || slug}" (${slug})`, editorEmail);
    } else if (op === "remove") {
      await rm(abs, { force: true });
      await git(["add", "--", rel]);
      await commit([rel], message || `Delete "${title || slug}" (${slug})`, editorEmail);
    } else {
      return send(404, { error: "unknown op" });
    }
    return send(200, { ok: true });
  } catch (e) {
    return send(500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `content-agent listening on http://127.0.0.1:${PORT} (writes ${CONTENT_REL} + git commit)`,
  );
});
