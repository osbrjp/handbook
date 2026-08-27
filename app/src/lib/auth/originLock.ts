// The Worker side of the "origin lock" (infra/README.md). Distinct from
// origin.ts, which resolves the app's own public URL — this decides whether a
// request is allowed to reach the app at all.
//
// The Worker answers on two hostnames: the CloudFront distribution that serves
// the public handbook, and its own *.workers.dev name. Cloudflare does not let
// us switch the latter off, and it serves the same gated content, so until the
// Worker checks provenance the CDN is advisory: anyone who learns the
// workers.dev name bypasses CloudFront and with it the WAF, the HSTS header,
// and the Origin rewrite the editor depends on.
//
// CloudFront attaches X-Origin-Verify as an ORIGIN CUSTOM HEADER, which it
// OVERWRITES on every request (infra/main.tf). A viewer therefore cannot forge
// or smuggle one, so the right value is proof the request came through the
// distribution.
export const ORIGIN_VERIFY_HEADER = "x-origin-verify";

/**
 * May this request reach the app?
 *
 * ENGAGED BY SETTING THE SECRET, not by deploying this code. An unset secret
 * means the lock is off, which is deliberate and load-bearing:
 *
 *   - it keeps the workers.dev host usable while CloudFront is still being
 *     built and verified (the distribution has to be tested end-to-end BEFORE
 *     DNS moves, and that testing happens against a Worker nothing fronts yet);
 *   - it makes disengaging a one-step rollback — `wrangler secret delete
 *     ORIGIN_VERIFY_SECRET` — instead of a redeploy, which matters because
 *     getting this wrong takes the whole site down rather than degrading it.
 *
 * So the safe order is: apply CloudFront, verify through the distribution,
 * THEN set this secret to the same value Terraform holds. Setting it first
 * 403s every reader, including the ones arriving through it.
 */
export function edgeRequestAllowed(
  presented: string | null | undefined,
  secret: string | undefined,
): boolean {
  if (!secret) return true;
  if (!presented) return false;
  return constantTimeEqual(presented, secret);
}

// Compared without an early exit on the first differing byte. A remote timing
// attack through two CDNs is far-fetched, but this costs microseconds and the
// alternative is a `===` that every future reviewer has to re-reason about.
// Length is allowed to short-circuit: the secret's length is not a secret.
// Safe for the base64 values Terraform generates (all single UTF-16 units).
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
