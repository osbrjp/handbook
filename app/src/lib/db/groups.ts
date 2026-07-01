export interface Group {
  id: number;
  key: string;
  label: string;
}

export async function listGroups(db: D1Database): Promise<Group[]> {
  const { results } = await db.prepare("SELECT id, key, label FROM groups ORDER BY label").all();
  return (results ?? []) as unknown as Group[];
}
