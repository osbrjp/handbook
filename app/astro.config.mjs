// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// SSR on Cloudflare Workers (house deploy target). `platformProxy` gives
// `astro dev` access to the SAME bindings as production — notably the local D1
// (SQLite via Miniflare) at Astro.locals.runtime.env.DB — so dev runs the exact
// Worker code path, no Node-vs-Workers divergence.
export default defineConfig({
  output: "server",
  // v14 auto-provides bindings to `astro dev` via the Cloudflare Vite plugin;
  // access them through the `cloudflare:workers` module (see src/middleware.ts).
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});
