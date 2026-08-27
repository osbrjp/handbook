import type { AstroCookies } from "astro";
import { CSRF_COOKIE } from "./auth/cookies";

// Double-submit CSRF: a Strict, HttpOnly cookie + a matching hidden field.
export function issueCsrf(cookies: AstroCookies, secure: boolean): string {
  const token = crypto.randomUUID();
  cookies.set(CSRF_COOKIE, token, { httpOnly: true, sameSite: "strict", path: "/", secure });
  return token;
}

export function checkCsrf(cookies: AstroCookies, submitted: FormDataEntryValue | null): boolean {
  const stored = cookies.get(CSRF_COOKIE)?.value;
  const s = typeof submitted === "string" ? submitted : "";
  if (!stored || !s || stored.length !== s.length) return false;
  let r = 0;
  for (let i = 0; i < stored.length; i++) r |= stored.charCodeAt(i) ^ s.charCodeAt(i);
  return r === 0; // constant-time compare
}
