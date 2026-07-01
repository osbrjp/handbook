import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { SESSION_COOKIE } from "./lib/auth/cookies";
import { lookupUser } from "./lib/auth/directory";
import { decryptSession } from "./lib/auth/session";
import type { Visitor } from "./lib/auth/visitor";

// Resolves the per-request visitor and content-store config into locals.
//
// GUARDRAIL: per-request only (Workers reuse module scope across requests, so a
// module-scoped visitor would bleed identity). `env` is the binding accessor
// (secrets/vars), not per-visitor state. FAIL CLOSED: any tamper/expiry/unknown
// user leaves visitor = null (anonymous). Role + groups are re-resolved from the
// git directory EVERY request (the cookie carries identity only) so a change
// takes effect at once. No database — identity is a git-committed config.
export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.visitor = null;
  // Content store config (read from env here; the editor builds the driver
  // lazily so readers never pay for it). Dev (DEV_LOGIN) uses the local content
  // agent for real file+git writes; otherwise the GitHub driver (deferred).
  ctx.locals.contentStore = {
    kind: env.DEV_LOGIN === "1" ? "local" : "github",
    localAgentUrl: env.CONTENT_AGENT_URL || "http://127.0.0.1:4322",
    localAgentToken: env.CONTENT_AGENT_TOKEN || "dev-agent",
    github: { token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO, branch: env.GITHUB_BRANCH },
  };

  const raw = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (raw) {
    const session = await decryptSession(raw, env.COOKIE_ENCRYPTION_KEY);
    if (session?.email) {
      const user = lookupUser(session.email);
      if (user) {
        ctx.locals.visitor = {
          email: user.email,
          role: user.role,
          groupKeys: user.groups ?? [],
        } satisfies Visitor;
      }
      // unknown user (not in the directory) => stays anonymous
    }
  }
  return next();
});
