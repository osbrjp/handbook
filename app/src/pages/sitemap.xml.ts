import type { APIRoute } from "astro";
import { publicClient, fetchNavPages, type PageRecord } from "../lib/directus";

// Built from the PUBLIC (anonymous) client only: a sitemap is for crawlers and
// must contain ONLY public pages — never enumerate internal/restricted slugs
// (red-team R2).
export const GET: APIRoute = async ({ site, url }) => {
  const base = (site?.toString().replace(/\/$/, "")) || url.origin;
  let pages: PageRecord[] = [];
  try {
    pages = await fetchNavPages(publicClient());
  } catch {
    pages = [];
  }
  const entries = pages
    .filter((p) => p.visibility === "public")
    .map((p) => `<url><loc>${base}/${p.slug}</loc></url>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc></url>${entries}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
