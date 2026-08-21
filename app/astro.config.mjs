// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// SSR on Cloudflare Workers (house deploy target). `astro dev` runs the same
// workerd runtime as production, so there's no Node-vs-Workers divergence. The
// app has NO datastore/bindings — content is git-backed markdown and identity
// is a git config; `cloudflare:workers` env only carries secrets/vars
// (COOKIE_ENCRYPTION_KEY, GOOGLE_*, etc.), read per request in src/middleware.ts.
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  // Astro's own CSRF guard: reject non-GET form posts whose `Origin` header
  // doesn't equal the request origin (403). It defaults to true in Astro 7 —
  // pinned explicitly because it is load-bearing security that would otherwise
  // vanish silently on a default change, and because it constrains deployment:
  // the check compares against the URL THE WORKER RECEIVES, never
  // `x-forwarded-host`, so any proxy in front (the planned CloudFront
  // distribution) MUST forward the original Host or every editor POST 403s.
  // See POC.md "Migration & production cutover". This layers over — and does
  // not replace — the app's own double-submit token in src/lib/csrf.ts.
  //
  // NOT a fix for that *on this adapter*: `security.allowedDomains`. It exists
  // in Astro 7 and looks like the answer (it allowlists hosts and then trusts
  // `x-forwarded-host` / `x-forwarded-proto`), but it is consumed only by the
  // NODE adapter's request reconstruction (astro/dist/core/app/node.js) and
  // the dev server. `@astrojs/cloudflare` never reads it — on Workers the
  // Request arrives with a real URL, so there is no forwarded-header trust
  // step to configure. Setting it here today would be inert; fix the Host at
  // the proxy instead.
  //
  // It DOES become the correct mechanism if this app is ever moved to
  // `@astrojs/node` behind a reverse proxy that terminates TLS (Cloudron,
  // nginx, Traefik). In that setup the proxy's `x-forwarded-*` headers are
  // what carry the real hostname, and `allowedDomains` is how you tell Astro
  // which of them to trust — without it the Node adapter ignores them and
  // checkOrigin compares against the internal container host instead.
  security: {
    checkOrigin: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
