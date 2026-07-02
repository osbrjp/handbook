// AES-GCM encrypted session cookie (Web Crypto — works on Workers and in Node).
// Ported from OSBR coop-csnet-poc's encryption pattern. The cookie carries the
// GitHub login plus the role verified against the repo at `checkedAt`; the
// middleware re-verifies the role against GitHub once it's older than its TTL,
// so a GitHub-side revoke takes effect within minutes, not the cookie lifetime.
//
// decryptSession fails CLOSED: any tamper/parse error OR a past `exp` returns
// null. AES-GCM's auth tag makes a tampered cookie fail decryption outright.

import type { Role } from "./visitor";

const enc = new TextEncoder();
const dec = new TextDecoder();

// The signed-in user's own GitHub token — used by the editor write path so
// content commits are authored by the ACTUAL PERSON (no bot). refresh/expiresAt
// are present for GitHub App tokens (expiring), absent for classic OAuth tokens.
export interface GhTokenSet {
  access: string;
  refresh?: string;
  expiresAt?: number; // epoch ms
}

export interface SessionData {
  login: string; // GitHub username — the only identity in the system (no emails)
  role: Role;
  checkedAt: number; // epoch ms of the last successful GitHub role check
  exp: number; // epoch ms
  ghToken?: GhTokenSet; // absent for dev-shim sessions
}

async function getKey(secret: string): Promise<CryptoKey> {
  if (!secret || secret.length < 32) {
    throw new Error("COOKIE_ENCRYPTION_KEY must be at least 32 characters");
  }
  // SHA-256 the full secret to a 32-byte key — uses all the entropy (not just
  // the first 32 chars) and is byte-safe for multibyte secrets.
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptSession(data: SessionData, secret: string): Promise<string> {
  const key = await getKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data))),
  );
  const payload = new Uint8Array(iv.length + ct.length);
  payload.set(iv, 0);
  payload.set(ct, iv.length);
  return b64urlEncode(payload);
}

export async function decryptSession(token: string, secret: string): Promise<SessionData | null> {
  try {
    const key = await getKey(secret);
    const payload = b64urlDecode(token);
    const iv = payload.slice(0, 12);
    const ct = payload.slice(12);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    const data = JSON.parse(dec.decode(pt)) as SessionData;
    if (!data || typeof data.login !== "string" || typeof data.exp !== "number") return null;
    if (data.role !== "admin" && data.role !== "editor" && data.role !== "reader") return null;
    if (typeof data.checkedAt !== "number") return null;
    if (data.ghToken && typeof data.ghToken.access !== "string") return null;
    if (Date.now() > data.exp) return null; // server-side expiry — don't trust cookie maxAge alone
    return data;
  } catch {
    return null;
  }
}
