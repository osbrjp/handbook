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

`handbook.osbrjp.com` resolves to this distribution (cut over August 2026;
GitHub Pages 301s here). `enable_dns_cutover` is `true`: it declares the
Route 53 alias records and compiles the canonical-host redirect into the
function, so the `*.cloudfront.net` domain answers 301 to the alias instead of
serving the site under a second name. The `Origin` rewrite runs either way.

The cutover itself was done by hand in the console (POC.md, cutover step 4.7)
while the flag was still `false`, which leaves a one-time chore: Terraform will
not create a record that already exists, so the A alias must be imported before
the first apply with the flag on. `aws_route53_record` import ids are
`ZONEID_NAME_TYPE`:

```sh
$ terraform init -backend-config=backend.hcl -input=false
$ ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name osbrjp.com \
    --query 'HostedZones[0].Id' --output text | sed 's|/hostedzone/||')
$ terraform import 'aws_route53_record.handbook["A"]' "${ZONE_ID}_handbook.osbrjp.com_A"
$ sh scripts/plan.sh
```

The plan should add the AAAA alias (the console cutover only made an A) and
republish the function with the redirect on — nothing else. Until it is
applied, that is the drift: no AAAA, and the CloudFront domain still answering
200 directly.

Verifying a distribution on its own domain again means the flag back to
`false` for that apply, or the redirect turns every check into a 301.

Two things the cutover depends on live outside Terraform, both in place:
**`OAUTH_ORIGIN = https://handbook.osbrjp.com`** on the Worker (a Cloudflare
dashboard variable — the rewrite fixes the CSRF check, not the app's sense of
its own identity; `/llms.txt` emitting `handbook.osbrjp.com` links is the proof
it is right, see `POC.md`), and the **origin lock**: `ORIGIN_VERIFY_SECRET` is
set on the Worker, matching `origin_secret` here, so
`osbr-handbook.osbrjp.workers.dev` answers 403. Rollback of the lock is
`wrangler secret delete ORIGIN_VERIFY_SECRET`, no redeploy.

## Still open

- **Retire GitHub Pages.** The old static site is still published with the
  custom domain attached. Keep it until this distribution has days of
  confidence, then POC.md cutover step 6. Rollback until then is the flag back
  to `false`, the alias records removed, and a CNAME to `osbrjp.github.io` —
  Route 53 will not hold a CNAME and an alias A for the same name.
- **CI with OIDC.** #98 asks for plan and apply to run from CI on short-lived
  OIDC credentials. That needs an IAM role and trust policy that do not exist in
  the account yet, so the workflow is not written — a workflow without the role
  would only fail every run. Until it lands, apply is a local, manual step.
- **WAF.** `web_acl_arn` is `null`. Attaching a web ACL is a follow-up.
- **Logging.** No standard access log or real-user monitoring is configured yet;
  observability is meant to be built in, not bolted on.
