import { test } from "node:test";
import assert from "node:assert/strict";

const { encryptSession, decryptSession } = await import("../src/lib/auth/session.ts");
const KEY = "dev-cookie-key-change-me-0123456789abcdef";

const sess = (over = {}) => ({
  login: "octocat",
  role: "reader",
  checkedAt: Date.now(),
  exp: Date.now() + 10_000,
  ...over,
});

test("round-trips a valid session", async () => {
  const tok = await encryptSession(sess({ role: "editor" }), KEY);
  const out = await decryptSession(tok, KEY);
  assert.equal(out?.login, "octocat");
  assert.equal(out?.role, "editor");
  assert.equal(typeof out?.checkedAt, "number");
});

test("rejects an expired session (server-side exp)", async () => {
  const tok = await encryptSession(sess({ exp: Date.now() - 1 }), KEY);
  assert.equal(await decryptSession(tok, KEY), null);
});

test("rejects a session with an unknown role (fail closed)", async () => {
  const tok = await encryptSession(sess({ role: "superadmin" }), KEY);
  assert.equal(await decryptSession(tok, KEY), null);
});

test("rejects a session missing checkedAt (fail closed)", async () => {
  const tok = await encryptSession(sess({ checkedAt: undefined }), KEY);
  assert.equal(await decryptSession(tok, KEY), null);
});

test("rejects a tampered token", async () => {
  const tok = await encryptSession(sess(), KEY);
  const bad = tok.slice(0, -3) + (tok.endsWith("AAA") ? "BBB" : "AAA");
  assert.equal(await decryptSession(bad, KEY), null);
});

test("rejects a token encrypted with a different key", async () => {
  const tok = await encryptSession(sess(), KEY);
  assert.equal(await decryptSession(tok, "another-32-char-min-key-abcdefghij"), null);
});

test("refuses to encrypt with a too-short key", async () => {
  await assert.rejects(() => encryptSession(sess({ exp: 1 }), "short"));
});
