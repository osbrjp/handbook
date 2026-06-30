import type { APIRoute } from "astro";
import { getNavPages, type PageRow } from "../lib/db/pages";

// Anonymous (null visitor) => public pages only by construction (red-team R2).
export const GET: APIRoute = async ({ locals, site, url }) => {
  const base = site?.toString().replace(/\/$/, "") || url.origin;
  let pages: PageRow[] = [];
  try {
    pages = await getNavPages(locals.db, null);
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
