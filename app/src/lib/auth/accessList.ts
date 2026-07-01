// Who may sign in at all. Authority for BOTH the OAuth callback gate and the
// dev-login shim. A successful Google login still has to clear this AND have a
// entry in the directory (src/lib/auth/directory.ts) — fail closed.
const ALLOWED_DOMAINS = ["osbrjp.com", "oz-design.jp"];
const ALLOWED_EMAILS = new Set<string>([]); // explicit extras, lowercase

export function isAllowed(email: string): boolean {
  const e = email.toLowerCase();
  if (ALLOWED_EMAILS.has(e)) return true;
  const domain = e.split("@")[1];
  return !!domain && ALLOWED_DOMAINS.includes(domain);
}
