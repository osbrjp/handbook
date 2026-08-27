// The one canonical host. Every other host — workers.dev, previews, localhost
// — is a copy, and the middleware serves those X-Robots-Tag: noindex so a
// staging copy never reaches search results. That header is now the ONLY thing
// distinguishing a copy from the real site: the on-page environment ribbon was
// removed deliberately, so a reader cannot tell by looking.
export const PROD_HOST = "handbook.osbrjp.com";

/**
 * Host of an origin URL, "" if unparseable.
 *
 * Callers MUST pass `locals.publicOrigin` (from OAUTH_ORIGIN) — never
 * `Astro.url.host` or the request `Host` header. Behind the CloudFront reverse
 * proxy those carry the ORIGIN's hostname (the workers.dev name), never the
 * host the visitor typed, so a Host-based check reports the wrong environment:
 * the live handbook would serve `X-Robots-Tag: noindex` on every page, forever
 * — invisibly keeping the real site out of search results.
 */
export function hostOf(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return "";
  }
}
