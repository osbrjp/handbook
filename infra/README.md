# infra

Terraform for the CloudFront distribution that fronts the handbook Worker.

CloudFront terminates TLS for `handbook.osbrjp.com`, then reverse-proxies to
`osbr-handbook.osbrjp.workers.dev`. Route 53, ACM, and WAF stay on AWS, where
the `osbrjp.com` zone already lives; the Worker stays on Cloudflare, deployed by
Wrangler. Terraform owns the AWS side only — it never touches the Worker, per
[One Tool Owns Each Resource](https://osbrjp.github.io/handbook/infra-planning-policy).

## Run it

```sh
$ cp backend.hcl.example backend.hcl   # fill in the real state bucket
$ export TF_VAR_origin_secret=...      # shared secret, also set on the Worker
$ sh scripts/plan.sh
$ sh scripts/deploy.sh                 # applies the plan you just read
```

`plan.sh` runs `fmt -check`, `validate`, and the CloudFront Function's unit
tests before planning, and writes `tfplan`. `deploy.sh` applies that saved plan
and deletes it, so nothing ships that a human has not read.

Credentials come from your AWS profile. There is no CI workflow for `infra/`
yet, so plan and apply are run by hand today — see **Still open** below.

## What it builds

| Resource | Why |
| --- | --- |
| ACM certificate (us-east-1) | CloudFront reads its certificate from us-east-1 only. |
| Distribution | Custom origin, HTTPS-only to the Worker, TLS 1.2+. |
| `Managed-AllViewerExceptHostHeader` | workers.dev routes by `Host`; the origin must receive its own domain, not the viewer's. |
| `handbook-content` cache policy (default) | Ours, not managed: every cookie and query string in the cache key (an authenticated page is never served to another reader), **no headers**, TTLs of 0 so the Worker's `Cache-Control` governs. The managed `UseOriginCacheControlHeaders-*` policies key on `host`, and cache-key headers are forwarded to the origin — that sent the viewer's Host to Cloudflare and 502'd every page. |
| `Managed-CachingOptimized` (`/_astro/*`) | Astro's build output is content-hashed and identical for everyone — cached once, not once per cookie. |
| `Managed-CachingDisabled` (`/api/*`) | The auth surface is never cached. |
| `handbook-hsts` response headers policy | The Worker sets the other security headers; HSTS is the gap. |
| `handbook-viewer-request` function | Rewrites `Origin` so Astro's `checkOrigin` accepts editor writes, and redirects the `*.cloudfront.net` domain to the canonical host after cutover. Attached to **every** behaviour — associations are per behaviour. |
| `X-Origin-Verify` origin custom header | Lets the Worker reject requests that bypass CloudFront. CloudFront overwrites a viewer-supplied header of the same name, so it cannot be forged. |

## Why the function rewrites `Origin`

Cloudflare's edge rejects any `Host` that is not the `workers.dev` hostname, so
CloudFront cannot forward the viewer's `Host` — the whole site would 403 before
the Worker ran. That leaves the Worker seeing `workers.dev` while the browser
sends `https://handbook.osbrjp.com`, and Astro's `security.checkOrigin` (pinned
on in the Worker's `astro.config.mjs`) compares the two: every save, approve,
reject and delete would return 403.

`Host` cannot be fixed — it is read-only in viewer-request events — so the
function translates the one legitimate public origin to the one the Worker
sees. A cross-site POST still carries its own `Origin`, is left untouched, and
is still rejected, so the security property is unchanged. This was measured
against the live Worker and decided in `POC.md` on the `i68-handbook-poc`
branch.

## The DNS cutover

`handbook.osbrjp.com` currently resolves to GitHub Pages. `enable_dns_cutover`
is `false` so the distribution can be built and tested on its own CloudFront
domain first:

```sh
$ curl -sI https://$(terraform output -raw distribution_domain_name)/
```

The flag also compiles the canonical-host redirect in or out of the function.
While it is `false` the CloudFront domain serves the site directly, which is
what makes that `curl` a 200 rather than a 301 to a name that still points at
GitHub Pages. The `Origin` rewrite runs either way — the editor has to work
before the cutover as well as after it.

To cut over: delete the existing `handbook.osbrjp.com` record (Route 53 will not
hold a CNAME and an alias A record for the same name), set
`enable_dns_cutover = true`, plan, and apply. Retiring the GitHub Pages
deployment is a separate change in this repository.

Also set **`OAUTH_ORIGIN = https://handbook.osbrjp.com`** on the Worker. The
rewrite fixes the CSRF check, not the app's sense of its own identity — see
`POC.md`. That is a Cloudflare dashboard change, not a Terraform one.

## Still open

- **Origin lock — code landed, not yet engaged.** The Worker checks
  `X-Origin-Verify` (`app/src/lib/auth/originLock.ts`) and refuses anything
  without it, but only once `ORIGIN_VERIFY_SECRET` is set on the Worker; unset
  means off, so the workers.dev URL is still reachable today. Engage it AFTER
  this distribution is applied and verified — setting it first 403s every
  reader — with `wrangler secret put ORIGIN_VERIFY_SECRET` matching the
  `origin_secret` here. Rollback is `wrangler secret delete`, no redeploy.
- **CI with OIDC.** #98 asks for plan and apply to run from CI on short-lived
  OIDC credentials. That needs an IAM role and trust policy that do not exist in
  the account yet, so the workflow is not written — a workflow without the role
  would only fail every run. Until it lands, apply is a local, manual step.
- **WAF.** `web_acl_arn` is `null`. Attaching a web ACL is a follow-up.
- **Logging.** No standard access log or real-user monitoring is configured yet;
  observability is meant to be built in, not bolted on.
