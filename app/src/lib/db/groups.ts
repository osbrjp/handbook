export interface Group {
  id: number;
  key: string;
  label: string;
}

export async function listGroups(db: D1Database): Promise<Group[]> {
  const { results } = await db.prepare("SELECT id, key, label FROM groups ORDER BY label").all();
  return (results ?? []) as unknown as Group[];
}

export async function getPageGroupKeys(db: D1Database, pageId: number): Promise<string[]> {
  const { results } = await db
    .prepare(
      "SELECT g.key FROM page_groups pg JOIN groups g ON g.id = pg.group_id WHERE pg.page_id = ?",
    )
    .bind(pageId)
    .all();
  return ((results ?? []) as { key: string }[]).map((r) => r.key);
}
