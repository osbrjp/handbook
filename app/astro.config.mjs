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
  security: {
    checkOrigin: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
