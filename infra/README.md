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

Credentials come from your AWS profile locally and from OIDC in CI — never a
long-lived access key.

## What it builds

| Resource | Why |
| --- | --- |
| ACM certificate (us-east-1) | CloudFront reads its certificate from us-east-1 only. |
| Distribution | Custom origin, HTTPS-only to the Worker, TLS 1.2+. |
| `Managed-AllViewerExceptHostHeader` | workers.dev routes by `Host`; the origin must receive its own domain, not the viewer's. |
| `Managed-UseOriginCacheControlHeaders-QueryStrings` (default) | Keeps every cookie in the cache key, so an authenticated page cannot be served to another reader, and honours the `Cache-Control` the Worker sends. |
| `Managed-CachingOptimized` (`/_astro/*`) | Astro's build output is content-hashed and identical for everyone — cached once, not once per cookie. |
| `Managed-CachingDisabled` (`/api/*`) | The auth surface is never cached. |
| `handbook-hsts` response headers policy | The Worker sets the other security headers; HSTS is the gap. |
| `handbook-canonical-host` function | Redirects the `*.cloudfront.net` domain to the canonical host — CloudFront has no native host-based redirect. |
| `X-Origin-Verify` origin custom header | Lets the Worker reject requests that bypass CloudFront. CloudFront overwrites a viewer-supplied header of the same name, so it cannot be forged. |

## The DNS cutover

`handbook.osbrjp.com` currently resolves to GitHub Pages. `enable_dns_cutover`
is `false` so the distribution can be built and tested on its own CloudFront
domain first:

```sh
$ curl -sI https://$(terraform output -raw distribution_domain_name)/
```

To cut over: delete the existing `handbook.osbrjp.com` record (Route 53 will not
hold a CNAME and an alias A record for the same name), set
`enable_dns_cutover = true`, plan, and apply. Retiring the GitHub Pages
deployment is a separate change in this repository.

## Still open

- **Worker side of the origin lock.** The Worker must check `X-Origin-Verify`
  and refuse requests without it. That code lives in the Worker's repository,
  not here, so until it lands the workers.dev URL is still reachable directly.
- **WAF.** `web_acl_arn` is `null`. Attaching a web ACL is a follow-up.
- **Logging.** No standard access log or real-user monitoring is configured yet;
  observability is meant to be built in, not bolted on.
