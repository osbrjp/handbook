import assert from "node:assert/strict";
import { test } from "node:test";

const { edgeRequestAllowed, ORIGIN_VERIFY_HEADER } = await import("../src/lib/auth/originLock.ts");

// Shaped like the real thing (base64 of 32 bytes) but NOT a live value —
// the deployed secret exists only in Terraform and the Worker.
const SECRET = "dGVzdC1vbmx5LW5vdC1hLXJlYWwtc2VjcmV0LXZhbHVlIQ==";

test("lock is OFF while the secret is unset — the workers.dev host stays reachable", () => {
  // The distribution has to be verified end-to-end before DNS moves, and that
  // testing hits a Worker nothing fronts yet. Regressing this to fail-closed
  // would make the Worker unreachable the moment it deploys.
  assert.equal(edgeRequestAllowed(null, undefined), true);
  assert.equal(edgeRequestAllowed(null, ""), true);
  assert.equal(edgeRequestAllowed("anything", undefined), true);
});

test("lock ON: the matching value passes, everything else is refused", () => {
  assert.equal(edgeRequestAllowed(SECRET, SECRET), true);
  assert.equal(edgeRequestAllowed(null, SECRET), false); // straight to workers.dev
  assert.equal(edgeRequestAllowed(undefined, SECRET), false);
  assert.equal(edgeRequestAllowed("", SECRET), false);
  assert.equal(edgeRequestAllowed("wrong", SECRET), false);
});

test("a near-miss is still refused (no prefix/length shortcuts)", () => {
  assert.equal(edgeRequestAllowed(SECRET.slice(0, -1), SECRET), false); // truncated
  assert.equal(edgeRequestAllowed(`${SECRET}x`, SECRET), false); // extended
  assert.equal(edgeRequestAllowed(SECRET.toLowerCase(), SECRET), false); // case matters
  assert.equal(edgeRequestAllowed(` ${SECRET}`, SECRET), false); // not trimmed
});

test("header name is lowercase — Headers.get is case-insensitive, but Workers normalizes", () => {
  assert.equal(ORIGIN_VERIFY_HEADER, "x-origin-verify");
  const req = new Request("https://example.test/", { headers: { "X-Origin-Verify": SECRET } });
  assert.equal(req.headers.get(ORIGIN_VERIFY_HEADER), SECRET);
  assert.equal(edgeRequestAllowed(req.headers.get(ORIGIN_VERIFY_HEADER), SECRET), true);
});
