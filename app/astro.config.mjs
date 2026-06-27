// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// SSR everywhere: per-request reader access control is impossible on static
// output. The Node adapter runs locally; swap to the Cloudflare adapter at
// deploy time (the frontend can live on Cloudflare; Directus+Postgres cannot).
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  vite: {
    plugins: [tailwindcss()],
  },
});
