/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// `cloudflare:workers` exports `env: Cloudflare.Env` — augment that namespace.
// Bindings/secrets are available in `astro dev` (local Miniflare from
// wrangler.toml + .dev.vars) and in production.
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    COOKIE_ENCRYPTION_KEY: string;
    DEV_LOGIN?: string;
    OAUTH_ORIGIN?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    // content store: "local" (dev, file+git) or "github" (prod, deferred)
    CONTENT_STORE?: string;
    GITHUB_TOKEN?: string;
    GITHUB_REPO?: string;
    GITHUB_BRANCH?: string;
  }
}

declare namespace App {
  interface Locals {
    db: D1Database;
    visitor: import("./lib/auth/visitor").Visitor | null;
    contentStore: import("./lib/content/store").ContentStoreConfig;
  }
}
