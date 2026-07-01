#!/usr/bin/env node
// @ts-nocheck — Node-only dev launcher (this project is typed for the Worker runtime).
// dev-edit.mjs — run `astro dev` and the local content agent together, so the
// in-browser editor's Save/Publish/Delete work on localhost. Ctrl-C stops both.
import { spawn } from "node:child_process";

const procs = [];
let ending = false;

function shutdown() {
  if (ending) return;
  ending = true;
  for (const p of procs) {
    try {
      p.kill("SIGTERM");
    } catch {}
  }
  process.exit();
}

function run(name, command) {
  const p = spawn(command, { stdio: "inherit", shell: true });
  p.on("exit", (code) => {
    console.log(`[dev-edit] ${name} exited (${code ?? "signal"}); stopping all.`);
    shutdown();
  });
  procs.push(p);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

run("content-agent", "node scripts/content-agent.mjs");
run("astro dev", "astro dev --port 4321");
