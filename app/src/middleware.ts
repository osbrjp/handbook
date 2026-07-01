import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { decryptSession } from "./lib/auth/session";
import { SESSION_COOKIE } from "./lib/auth/cookies";
import type { Visitor, Role } from "./lib/auth/visitor";

// Attaches the per-request D1 handle + resolved visitor to locals.
//
// GUARDRAIL: per-request only (Workers reuse module scope across requests, so a
// module-scoped visitor would bleed identity). `env` is the binding accessor,
// not per-visitor state. FAIL CLOSED: any tamper/expiry/unknown-user leaves
// visitor = null (anonymous). Role + groups are re-resolved from D1 EVERY
// request (cookie carries identity only) so a demotion takes effect at once.
export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.db = env.DB;
  ctx.locals.visitor = null;

  const raw = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (raw) {
    const session = await decryptSession(raw, env.COOKIE_ENCRYPTION_KEY);
    if (session?.email) {
      const email = session.email.toLowerCase();
      const user = (await env.DB.prepare("SELECT email, role FROM users WHERE email=?")
        .bind(email)
        .first()) as { email: string; role: Role } | null;
      if (user) {
        // Resolve both the numeric ids (legacy D1 content ACL) and the stable
        // group KEYS (git-backed content ACL) in one query.
        const { results } = await env.DB.prepare(
          "SELECT g.id AS group_id, g.key AS group_key FROM user_groups ug JOIN groups g ON g.id = ug.group_id WHERE ug.email=?",
        )
          .bind(email)
          .all();
        const rows = (results ?? []) as { group_id: number; group_key: string }[];
        const groupIds = rows.map((r) => Number(r.group_id));
        const groupKeys = rows.map((r) => String(r.group_key));
        ctx.locals.visitor = { email: user.email, role: user.role, groupIds, groupKeys } satisfies Visitor;
      }
      // unknown user (not in allow-list table) => stays anonymous
    }
  }
  return next();
});
