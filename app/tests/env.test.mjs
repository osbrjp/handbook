import assert from "node:assert/strict";
import { test } from "node:test";

const { hostOf, PROD_HOST } = await import("../src/lib/env.ts");

// Regression guard for a bug that is INVISIBLE at runtime: behind the
// CloudFront reverse proxy the request Host is the workers.dev origin name,
// never the host the visitor typed. Anything keyed on the request Host
// therefore decides "this is not production" on the real handbook — setting
// X-Robots-Tag: noindex on every page and keeping the live site out of search
// results indefinitely. The site looks perfect while it happens. Identity must
// come from OAUTH_ORIGIN (locals.publicOrigin), which is why hostOf takes an
// ORIGIN, not a host.
test("hostOf extracts the host from a public origin", () => {
  assert.equal(hostOf("https://handbook.osbrjp.com"), PROD_HOST);
  assert.equal(hostOf("https://handbook.osbrjp.com/"), PROD_HOST);
  assert.equal(hostOf("http://localhost:4321"), "localhost:4321");
  assert.equal(hostOf("https://osbr-handbook.osbrjp.workers.dev"), "osbr-handbook.osbrjp.workers.dev");
});

test("hostOf returns '' for junk rather than throwing (fails closed to noindex)", () => {
  // A throw here would 500 every response; "" simply never equals PROD_HOST,
  // so the safe outcome (noindex) is what a malformed value gets.
  assert.equal(hostOf(""), "");
  assert.equal(hostOf("not-a-url"), "");
  assert.equal(hostOf("handbook.osbrjp.com"), ""); // bare host is NOT an origin
});

test("the production origin is the only one treated as production", () => {
  // The proxy's backend hostname must NOT read as production — that is exactly
  // the confusion this whole indirection exists to prevent.
  assert.notEqual(hostOf("https://osbr-handbook.osbrjp.workers.dev"), PROD_HOST);
  assert.equal(hostOf(`https://${PROD_HOST}`), PROD_HOST);
});
