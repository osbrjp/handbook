import assert from "node:assert/strict";
import { test } from "node:test";

const { safeReturnUrl, getOrigin } = await import("../src/lib/auth/origin.ts");

const ORIGIN = "https://handbook.osbrjp.com";

test("safeReturnUrl allows same-origin/relative, blocks open redirects", () => {
  assert.equal(safeReturnUrl("/foo", ORIGIN), "/foo");
  assert.equal(safeReturnUrl(`${ORIGIN}/ok`, ORIGIN), `${ORIGIN}/ok`);
  assert.equal(safeReturnUrl("//evil.com", ORIGIN), "/"); // protocol-relative
  assert.equal(safeReturnUrl("/\\evil.com", ORIGIN), "/"); // backslash normalizes to //
  assert.equal(safeReturnUrl("/\\/evil.com", ORIGIN), "/");
  assert.equal(safeReturnUrl("https://evil.com/", ORIGIN), "/"); // off-origin
  assert.equal(safeReturnUrl(null, ORIGIN), "/");
  assert.equal(safeReturnUrl(undefined, ORIGIN), "/");
});

test("getOrigin: OAUTH_ORIGIN wins, trailing slash stripped", () => {
  const req = new Request("http://localhost/x", { headers: { host: "localhost" } });
  assert.equal(getOrigin(req, { OAUTH_ORIGIN: "https://h.osbrjp.com/" }), "https://h.osbrjp.com");
});

test("getOrigin: derives from request in dev, throws when unset outside dev (fail closed)", () => {
  const req = new Request("http://localhost:4321/x", { headers: { host: "localhost:4321" } });
  assert.equal(getOrigin(req, { DEV_LOGIN: "1" }), "http://localhost:4321");
  assert.throws(() => getOrigin(req, {})); // no OAUTH_ORIGIN and not dev
});
