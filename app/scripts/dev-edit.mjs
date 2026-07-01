#!/usr/bin/env node
// @ts-nocheck — Node-only dev launcher (this project is typed for the Worker runtime).
// dev-edit.mjs — one command to run the dev server + the local content agent, so
// the in-browser editor's Save/Publish/Delete work on localhost.
//
// `astro dev` in this setup DAEMONIZES: the foreground command starts a
// background server and returns (stop it later with `astro dev stop`). So we
// (1) start that daemon and wait for it to come up, then (2) run the content
// agent in the foreground. Ctrl-C stops the agent AND the dev daemon.
import { spawn, spawnSync } from "node:child_process";

function runToExit(command) {
  return new Promise((resolve) => {
    const p = spawn(command, { stdio: "inherit", shell: true });
    p.on("exit", (code) => resolve(code ?? 0));
  });
}

let stopping = false;
function stopAll(agent) {
  if (stopping) return;
  stopping = true;
  try {
    agent?.kill("SIGTERM");
  } catch {}
  try {
    spawnSync("astro dev stop", { stdio: "inherit", shell: true });
  } catch {}
  process.exit(0);
}

// 1. Start the dev daemon (foreground command returns once it's up).
await runToExit("astro dev --port 4321");

// 2. Run the content agent in the foreground; it keeps this process alive.
const agent = spawn("node scripts/content-agent.mjs", { stdio: "inherit", shell: true });
process.on("SIGINT", () => stopAll(agent));
process.on("SIGTERM", () => stopAll(agent));
agent.on("exit", () => stopAll(agent));

console.log("\n[dev-edit] dev server + content agent running. Ctrl-C stops both.\n");
