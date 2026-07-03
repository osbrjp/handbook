/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// `cloudflare:workers` exports `env: Cloudflare.Env` — augment that namespace.
// Only secrets/vars (no bindings/datastore): available in `astro dev` from
// .dev.vars + wrangler.toml [vars], and in production as Worker secrets.
declare namespace Cloudflare {
  interface Env {
    COOKIE_ENCRYPTION_KEY: string;
    DEV_LOGIN?: string;
    OAUTH_ORIGIN?: string;
    // GitHub OAuth App (login) — identity only, no scopes
    GITHUB_OAUTH_CLIENT_ID?: string;
    GITHUB_OAUTH_CLIENT_SECRET?: string;
    // Bot token: reads collaborator permissions (ROLE CHECKS ONLY — content
    // writes use the signed-in user's own token, never this one).
    // Worker secret / .dev.vars — never committed.
    GITHUB_TOKEN?: string;
    GITHUB_REPO?: string; // owner/name, default osbrjp/handbook
    GITHUB_BRANCH?: string; // base branch for content (default "main")
    GITHUB_WRITE_MODE?: string; // "pr" (default: submit-for-review) | "direct"
    // Editing: unset = AUTO (on when the session token is GitHub-App-issued,
    // i.e. carries a refresh token); "1" = force on; "0" = kill switch.
    GITHUB_WRITE_ENABLED?: string;

    // content store: dev (DEV_LOGIN=1) uses the local content agent; prod the GitHub driver
    CONTENT_AGENT_URL?: string; // default http://127.0.0.1:4322
    CONTENT_AGENT_TOKEN?: string; // shared token with the local agent
  }
}

declare namespace App {
  interface Locals {
    visitor: import("./lib/auth/visitor").Visitor | null;
    contentStore: import("./lib/content/store").ContentStoreConfig;
  }
}
