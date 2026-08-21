import type { APIRoute } from "astro";
import { getNavPages, type PageRow } from "../lib/content/pages";

// Anonymous (null visitor) => public pages only by construction (red-team R2).
export const GET: APIRoute = async ({ site, locals }) => {
  // locals.publicOrigin, NOT url.origin — behind the CloudFront reverse proxy
  // url.origin is the workers.dev origin name, so the sitemap would advertise
  // the proxy's backend to search engines. `site` still wins if ever set.
  const base = site?.toString().replace(/\/$/, "") || locals.publicOrigin;
  let pages: PageRow[] = [];
  try {
    pages = await getNavPages(null);
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
