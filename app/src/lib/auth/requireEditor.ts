import { isEditorRole, type Visitor } from "./visitor";

// Hard write-gate. Returns 404 (NOT 403) for non-editors so the editor
// surfaces give no existence signal. Roles are pure CAPABILITY (edit/approve);
// they never change what published content someone may read. Editors both
// edit AND run the review dashboard (approve & publish) — anyone with repo
// write can merge on GitHub anyway.
export function requireEditor(locals: { visitor: Visitor | null }): Response | null {
  return isEditorRole(locals.visitor?.role) ? null : new Response(null, { status: 404 });
}
