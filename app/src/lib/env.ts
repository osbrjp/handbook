// Which environment is this request being served from? ONE source of truth,
// shared by the middleware (X-Robots-Tag: noindex off-prod) and the visible
// environment ribbon (Base layout).
//   local      — `astro dev` on a laptop
//   poc        — a built Worker on any host that isn't the real domain
//                (osbr-handbook.*.workers.dev, previews, ...). Named for what
//                it IS during the evaluation period — a proof of concept, not
//                the blessed staging of a production system. The real domain
//                shows no ribbon at all, so the label retires with the POC.
//   production — the one canonical host
export const PROD_HOST = "handbook.osbrjp.com";

export type EnvName = "local" | "poc" | "production";

export function environmentName(host: string): EnvName {
  if (import.meta.env.DEV) return "local";
  return host === PROD_HOST ? "production" : "poc";
}
