import { isAdminRole, isEditorRole, type Visitor } from "./visitor";

// Hard write-gates. Return a 404 (NOT 403) for the unauthorized so the admin
// surfaces give no existence signal. Roles are pure CAPABILITY (edit/approve);
// they never change what published content someone may read.

/** Editing surface: editors AND admins. */
export function requireEditor(locals: { visitor: Visitor | null }): Response | null {
  return isEditorRole(locals.visitor?.role) ? null : new Response(null, { status: 404 });
}

/** Review dashboard (approve & publish): admins only. */
export function requireAdmin(locals: { visitor: Visitor | null }): Response | null {
  return isAdminRole(locals.visitor?.role) ? null : new Response(null, { status: 404 });
}
