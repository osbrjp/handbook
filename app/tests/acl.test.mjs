import { test } from "node:test";
import assert from "node:assert/strict";

// The content ACL is now a pure boolean predicate (canRead), replacing the old
// readableWhere SQL. Same truth table; assert on outcomes.
const { canRead } = await import("../src/lib/content/acl.ts");

const pub = { status: "published", visibility: "public", groups: [] };
const internal = { status: "published", visibility: "internal", groups: [] };
const restricted = { status: "published", visibility: "restricted", groups: ["leadership"] };
const draft = { status: "draft", visibility: "public", groups: [] };

const editor = { login: "ed", role: "editor", groupKeys: [] };
const reader = (keys = []) => ({ login: "rd", role: "reader", groupKeys: keys });

test("anonymous: only published public pages", () => {
  assert.equal(canRead(pub, null), true);
  assert.equal(canRead(internal, null), false);
  assert.equal(canRead(restricted, null), false);
  assert.equal(canRead(draft, null), false);
});

test("reader: public + internal; restricted only with a matching group; no drafts", () => {
  assert.equal(canRead(pub, reader()), true);
  assert.equal(canRead(internal, reader()), true);
  assert.equal(canRead(restricted, reader()), false); // no groups
  assert.equal(canRead(restricted, reader(["leadership"])), true);
  assert.equal(canRead(restricted, reader(["other"])), false);
  assert.equal(canRead(draft, reader()), false);
});

test("editor: everything including drafts", () => {
  assert.equal(canRead(draft, editor), true);
  assert.equal(canRead(internal, editor), true);
  assert.equal(canRead(restricted, editor), true);
});

test("fails closed on missing/unknown visibility", () => {
  assert.equal(
    canRead({ status: "published", visibility: undefined, groups: [] }, reader()),
    false,
  );
  assert.equal(canRead({ status: "published", visibility: "bogus", groups: [] }, reader()), false);
});
