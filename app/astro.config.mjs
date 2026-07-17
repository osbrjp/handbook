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
  vite: {
    plugins: [tailwindcss()],
  },
});
