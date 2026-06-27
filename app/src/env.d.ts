/// <reference types="astro/client" />

interface DirectusUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

declare namespace App {
  interface Locals {
    // Per-request Directus client (visitor-scoped if logged in, else public).
    // Typed loosely on purpose — the SDK's generic client type adds friction
    // without value for the POC.
    // biome-ignore lint/suspicious/noExplicitAny: SDK client generic
    client: any;
    user: DirectusUser | null;
    sessionToken: string | null;
  }
}
