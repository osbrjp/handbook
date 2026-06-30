// Google OAuth helpers (authorize URL + code→token exchange). Pure fetch,
// ported from the coop-csnet-poc OauthHelper (MCP/approval-dialog code dropped).

export function getUpstreamAuthorizeUrl(o: {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  hd?: string;
}): string {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", o.clientId);
  u.searchParams.set("redirect_uri", o.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", o.scope);
  u.searchParams.set("state", o.state);
  u.searchParams.set("access_type", "online");
  u.searchParams.set("prompt", "select_account");
  if (o.hd) u.searchParams.set("hd", o.hd);
  return u.toString();
}

export async function fetchUpstreamAuthToken(o: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string } | { error: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: o.clientId,
      client_secret: o.clientSecret,
      code: o.code,
      redirect_uri: o.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return { error: `token_exchange_${res.status}` };
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ? { accessToken: json.access_token } : { error: "no_access_token" };
}

export async function fetchGoogleUserinfo(
  accessToken: string,
): Promise<{ email?: string; name?: string; verified_email?: boolean } | null> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as { email?: string; name?: string; verified_email?: boolean };
}
