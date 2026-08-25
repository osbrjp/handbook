locals {
  origin_id = "worker"
}

data "aws_route53_zone" "root" {
  name         = var.hosted_zone_name
  private_zone = false
}

# CloudFront's managed policies cover every case here, so the only policy we
# own is the one that adds the header the Worker does not send (see below).
data "aws_cloudfront_cache_policy" "use_origin_cache_control" {
  name = "Managed-UseOriginCacheControlHeaders-QueryStrings"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

# workers.dev routes by Host, so the origin must receive its own domain name.
# This policy drops the viewer's Host and forwards everything else.
data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

## Certificate

resource "aws_acm_certificate" "handbook" {
  provider = aws.us_east_1

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.handbook.domain_validation_options :
    option.domain_name => option
  }

  zone_id         = data.aws_route53_zone.root.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  records         = [each.value.resource_record_value]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "handbook" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.handbook.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

## Edge behaviour

# The Worker already sets X-Frame-Options, X-Content-Type-Options, and
# Referrer-Policy. HSTS is the one it leaves out, and override = false keeps
# CloudFront from fighting the origin should the Worker start sending it.
resource "aws_cloudfront_response_headers_policy" "hsts" {
  name    = "handbook-hsts"
  comment = "Adds Strict-Transport-Security, which the Worker does not send."

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = false
      override                   = false
    }
  }
}

# A distribution answers on its own cloudfront.net domain as well as the alias,
# and CloudFront cannot redirect between them on its own.
resource "aws_cloudfront_function" "canonical_host" {
  name    = "handbook-canonical-host"
  runtime = "cloudfront-js-2.0"
  comment = "Redirects requests that arrive on any host other than the canonical one."
  publish = true

  code = templatefile("${path.module}/functions/canonical-host.js", {
    canonical_host = var.domain_name
  })
}

resource "aws_cloudfront_distribution" "handbook" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "OSBR Handbook — reverse proxy to the Cloudflare Worker"
  aliases         = [var.domain_name]
  price_class     = var.price_class
  web_acl_id      = var.web_acl_arn

  origin {
    origin_id   = local.origin_id
    domain_name = var.origin_domain_name

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    # CloudFront overwrites a viewer-supplied header of the same name, so the
    # Worker can treat this as proof the request came through the distribution
    # and reject anything hitting workers.dev directly.
    custom_header {
      name  = "X-Origin-Verify"
      value = var.origin_secret
    }
  }

  # Pages carry a session cookie and the Worker answers with Vary: Cookie.
  # This managed policy keeps every cookie in the cache key, so one reader's
  # authenticated page can never be served to another, and honours the
  # Cache-Control the Worker already sends.
  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id            = data.aws_cloudfront_cache_policy.use_origin_cache_control.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.hsts.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.canonical_host.arn
    }
  }

  # Astro's build output is content-hashed, so it is the same file for every
  # reader and can be cached once instead of once per cookie.
  ordered_cache_behavior {
    path_pattern           = var.static_path_pattern
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.hsts.id
  }

  # Login and the rest of the auth surface must never be cached.
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.hsts.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.handbook.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

## Cutover

resource "aws_route53_record" "handbook" {
  for_each = var.enable_dns_cutover ? toset(["A", "AAAA"]) : toset([])

  zone_id = data.aws_route53_zone.root.zone_id
  name    = var.domain_name
  type    = each.value

  alias {
    name                   = aws_cloudfront_distribution.handbook.domain_name
    zone_id                = aws_cloudfront_distribution.handbook.hosted_zone_id
    evaluate_target_health = false
  }
}
