// Which environment is this request being served from? ONE source of truth,
// shared by the middleware (X-Robots-Tag: noindex off-prod) and the visible
// environment ribbon (Base layout).
//   local      — `astro dev` on a laptop
//   staging    — a built Worker on any host that isn't the real domain
//                (osbr-handbook-staging.*.workers.dev, previews, ...)
//   production — the one canonical host
export const PROD_HOST = "handbook.osbrjp.com";

export type EnvName = "local" | "staging" | "production";

export function environmentName(host: string): EnvName {
  if (import.meta.env.DEV) return "local";
  return host === PROD_HOST ? "production" : "staging";
}
