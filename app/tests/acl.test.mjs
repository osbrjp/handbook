import { test } from "node:test";
import assert from "node:assert/strict";

// The content ACL: one pure boolean predicate. Two tiers, no roles:
//   public   → anyone;  internal → any signed-in person.
// Drafts never reach it (everything in the build is published — unmerged work
// lives on handbook/<slug> branches).
const { canRead } = await import("../src/lib/content/acl.ts");

const pub = { visibility: "public" };
const internal = { visibility: "internal" };

const reader = { login: "rd", role: "reader" };
const editor = { login: "ed", role: "editor" };

test("anonymous: public only", () => {
  assert.equal(canRead(pub, null), true);
  assert.equal(canRead(internal, null), false);
});

test("any signed-in visitor reads public + internal — role plays NO part", () => {
  for (const v of [reader, editor]) {
    assert.equal(canRead(pub, v), true);
    assert.equal(canRead(internal, v), true);
  }
});

test("fails closed on missing/unknown visibility, even signed in", () => {
  assert.equal(canRead({ visibility: undefined }, reader), false);
  assert.equal(canRead({ visibility: "bogus" }, editor), false);
  assert.equal(canRead({ visibility: "restricted" }, editor), false); // legacy tier: denied
});
