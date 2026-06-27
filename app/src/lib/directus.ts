// Per-request Directus client factory + read helpers.
//
// GUARDRAIL (red-team R1): there is NO module-scoped authenticated client in
// this codebase. A singleton client shares one auth state across concurrent
// SSR requests and leaks one visitor's identity into another's. Every request
// builds its own client here. `scripts/guard-no-module-client.mjs` fails CI if
// a client is constructed outside this file, or if the SDK's stateful
// auto-refresh auth client is used at all.

import {
  createDirectus,
  rest,
  readMe,
  readItems,
  type DirectusClient,
  type RestClient,
} from "@directus/sdk";

export type Visibility = "public" | "internal" | "restricted";

export interface PageRecord {
  id: string | number;
  title: string;
  slug: string;
  section: string;
  nav_label: string;
  sort: number;
  visibility: Visibility;
  status: string;
  body: string;
}

interface Schema {
  pages: PageRecord[];
}

export type HandbookClient = DirectusClient<Schema> & RestClient<Schema>;

const SERVER_URL =
  import.meta.env.DIRECTUS_INTERNAL_URL ||
  import.meta.env.PUBLIC_DIRECTUS_URL ||
  "http://localhost:8055";

/** Unauthenticated client — sees only what the Directus `Public` role allows. */
export function publicClient(): HandbookClient {
  return createDirectus<Schema>(SERVER_URL).with(rest());
}

/**
 * Visitor-scoped client. Forwards the visitor's Directus session cookie so
 * Directus authorizes reads AS THE VISITOR. Fresh instance per request.
 */
export function visitorClient(sessionToken: string): HandbookClient {
  return createDirectus<Schema>(SERVER_URL).with(
    rest({
      // biome-ignore lint/suspicious/noExplicitAny: SDK request option shape
      onRequest: (options: any) => {
        options.headers = {
          ...(options.headers || {}),
          Cookie: `directus_session_token=${sessionToken}`,
        };
        return options;
      },
    }),
  );
}

const PAGE_FIELDS = [
  "id",
  "title",
  "slug",
  "section",
  "nav_label",
  "sort",
  "visibility",
  "status",
  "body",
] as const;

const NAV_FIELDS = ["slug", "title", "nav_label", "section", "sort", "visibility"] as const;

/**
 * Fetch the navigation list. Returns ONLY pages the current client is permitted
 * to read — Directus filters by the visitor's policies. This is why nav/sitemap
 * built from this query cannot enumerate restricted slugs (red-team R2).
 */
export async function fetchNavPages(client: HandbookClient): Promise<PageRecord[]> {
  return client.request(
    readItems("pages", {
      fields: NAV_FIELDS,
      filter: { status: { _eq: "published" } },
      sort: ["section", "sort"],
      limit: -1,
    }),
  ) as Promise<PageRecord[]>;
}

/** Fetch one published page by slug, or null. Permission-filtered by Directus. */
export async function fetchPageBySlug(
  client: HandbookClient,
  slug: string,
): Promise<PageRecord | null> {
  const rows = (await client.request(
    readItems("pages", {
      fields: PAGE_FIELDS,
      filter: { slug: { _eq: slug }, status: { _eq: "published" } },
      limit: 1,
    }),
  )) as PageRecord[];
  return rows[0] ?? null;
}

/** Resolve the logged-in user, or null if the token is invalid/expired. */
export async function fetchMe(client: HandbookClient): Promise<DirectusUser | null> {
  try {
    return (await client.request(
      readMe({ fields: ["id", "email", "first_name", "last_name"] }),
    )) as unknown as DirectusUser;
  } catch {
    return null;
  }
}
