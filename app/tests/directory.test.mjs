import assert from "node:assert/strict";
import { test } from "node:test";

const { lookupUser } = await import("../src/lib/auth/directory.ts");

test("known users resolve; unknown is null (fail closed)", () => {
  assert.equal(lookupUser("editor@osbrjp.com")?.role, "editor");
  assert.equal(lookupUser("reader@osbrjp.com")?.role, "reader");
  assert.equal(lookupUser("nobody@osbrjp.com"), null);
});

test("email match is case-insensitive", () => {
  assert.equal(lookupUser("EDITOR@OSBRJP.com")?.role, "editor");
});

test("DEV_USERS override: parses role, defaults to reader, ignores non-matches", () => {
  assert.equal(lookupUser("x@osbrjp.com", "x@osbrjp.com:editor")?.role, "editor");
  assert.equal(lookupUser("y@osbrjp.com", "y@osbrjp.com")?.role, "reader"); // no role => reader
  assert.equal(lookupUser("z@osbrjp.com", "other@osbrjp.com:editor"), null); // not listed
  assert.equal(lookupUser("x@osbrjp.com", ""), null); // empty override
  assert.equal(lookupUser("x@osbrjp.com", undefined), null); // no override
});
