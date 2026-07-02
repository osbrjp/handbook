import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { resolveRole } from "./lib/auth/github";
import { SESSION_COOKIE, sessionCookieOptions } from "./lib/auth/cookies";
import { getOrigin } from "./lib/auth/origin";
import { decryptSession, encryptSession } from "./lib/auth/session";
import type { Visitor } from "./lib/auth/visitor";

// How long a GitHub-verified role is trusted before re-checking. Short enough
// that revoking someone on GitHub locks them out in minutes; long enough that
// requests almost never pay the GitHub API round-trip.
const ROLE_TTL_MS = 10 * 60_000;

// Resolves the per-request visitor and content-store config into locals.
//
// GUARDRAIL: per-request only (Workers reuse module scope across requests, so a
// module-scoped visitor would bleed identity). `env` is the binding accessor
// (secrets/vars), not per-visitor state. FAIL CLOSED: any tamper/expiry leaves
// visitor = null (anonymous). Identity is the GitHub login; the role was
// verified against the repo's collaborator permissions when the session was
// minted and is RE-VERIFIED here once it's older than ROLE_TTL_MS — no
// database, no directory, no allow-list in the codebase.
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
    if (session) {
      let { role, checkedAt } = session;
      let revoked = false;

      // Re-verify a stale role against GitHub. Skipped in dev (DEV_LOGIN=1),
      // where sessions come from the dev-login shim and aren't real GitHub users.
      if (env.DEV_LOGIN !== "1" && Date.now() - checkedAt > ROLE_TTL_MS) {
        try {
          const fresh = await resolveRole({
            token: env.GITHUB_TOKEN ?? "",
            repo: env.GITHUB_REPO || "osbrjp/handbook",
            login: session.login,
          });
          if (fresh) {
            role = fresh;
            checkedAt = Date.now();
            // Re-mint so the next ~10 min of requests skip the API round-trip.
            const cookie = await encryptSession(
              { login: session.login, role, checkedAt, exp: session.exp },
              env.COOKIE_ENCRYPTION_KEY,
            );
            ctx.cookies.set(
              SESSION_COOKIE,
              cookie,
              sessionCookieOptions(getOrigin(ctx.request, env)),
            );
          } else {
            // Definitive 404: no longer a collaborator — revoked on GitHub.
            revoked = true;
            ctx.cookies.delete(SESSION_COOKIE, { path: "/" });
          }
        } catch {
          // GitHub API trouble (outage/rate limit): keep the previously
          // VERIFIED role until the next successful check rather than locking
          // the whole company out. New logins still fail closed in callback.ts.
        }
      }

      if (!revoked) {
        ctx.locals.visitor = {
          login: session.login,
          role,
          groupKeys: [], // groups tier unused; would map to GitHub teams (see auth/groups.ts)
        } satisfies Visitor;
      }
    }
  }
  return next();
});
