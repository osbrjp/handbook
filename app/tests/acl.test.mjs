import { test } from "node:test";
import assert from "node:assert/strict";

const { readableWhere } = await import("../src/lib/db/pages.ts");

test("anonymous: published public pages only", () => {
  const w = readableWhere(null);
  assert.match(w.sql, /status='published'/);
  assert.match(w.sql, /visibility='public'/);
  assert.doesNotMatch(w.sql, /internal/);
  assert.equal(w.binds.length, 0);
});

test("editor: unrestricted (drafts too)", () => {
  const w = readableWhere({ email: "e@osbrjp.com", role: "editor", groupIds: [] });
  assert.equal(w.sql, "1=1");
});

test("reader without groups: restricted can NEVER match", () => {
  const w = readableWhere({ email: "r@osbrjp.com", role: "reader", groupIds: [] });
  assert.match(w.sql, /visibility='internal'/);
  assert.match(w.sql, /restricted' AND 0\)/);
  assert.equal(w.binds.length, 0);
});

test("reader with groups: EXISTS subquery + bound group ids", () => {
  const w = readableWhere({ email: "r@osbrjp.com", role: "reader", groupIds: [3, 7] });
  assert.match(w.sql, /EXISTS \(SELECT 1 FROM page_groups/);
  assert.deepEqual(w.binds, [3, 7]);
});
