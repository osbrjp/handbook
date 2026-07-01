/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// `cloudflare:workers` exports `env: Cloudflare.Env` — augment that namespace.
// Bindings/secrets are available in `astro dev` (local Miniflare from
// wrangler.toml + .dev.vars) and in production.
declare namespace Cloudflare {
  interface Env {
    COOKIE_ENCRYPTION_KEY: string;
    DEV_LOGIN?: string;
    OAUTH_ORIGIN?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    // content store: dev uses the local content agent; prod the GitHub driver
    CONTENT_STORE?: string;
    CONTENT_AGENT_URL?: string; // default http://127.0.0.1:4322
    CONTENT_AGENT_TOKEN?: string; // shared token with the local agent
    GITHUB_TOKEN?: string;
    GITHUB_REPO?: string;
    GITHUB_BRANCH?: string;
  }
}

declare namespace App {
  interface Locals {
    visitor: import("./lib/auth/visitor").Visitor | null;
    contentStore: import("./lib/content/store").ContentStoreConfig;
  }
}
