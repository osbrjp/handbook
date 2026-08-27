variable "aws_region" {
  type        = string
  description = "Region for the non-CloudFront resources. CloudFront and ACM are global / us-east-1 regardless."
  default     = "ap-northeast-1"
}

variable "domain_name" {
  type        = string
  description = "Canonical public hostname of the handbook."
  default     = "handbook.osbrjp.com"
}

variable "enable_dns_cutover" {
  type        = bool
  description = <<-EOT
    Whether to point domain_name at this distribution in Route 53. Left false so the
    distribution can be verified on its own CloudFront domain first; the name still
    resolves to GitHub Pages until this flips. Deleting the existing record for
    domain_name is a separate, deliberate step — see README.md.
  EOT
  default     = false
}

variable "hosted_zone_name" {
  type        = string
  description = "Public Route 53 hosted zone that domain_name belongs to."
  default     = "osbrjp.com"
}

variable "origin_domain_name" {
  type        = string
  description = "Cloudflare Worker that serves the handbook. CloudFront treats it as a custom origin."
  default     = "osbr-handbook.osbrjp.workers.dev"
}

variable "origin_secret" {
  type        = string
  description = "Shared secret sent as X-Origin-Verify so the Worker can reject requests that bypass CloudFront."
  sensitive   = true
}

variable "price_class" {
  type        = string
  description = "CloudFront edge locations to use. PriceClass_200 serves the readership in Japan and Malaysia without paying for the full global footprint — check the current price class region list before assuming any other region is covered."
  default     = "PriceClass_200"
}

variable "static_path_pattern" {
  type        = string
  description = "Path pattern for the Astro build output. Content-hashed, identical for every reader, so it is cached without the cookie."
  default     = "/_astro/*"
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to every taggable resource, for cost allocation."
  default = {
    Project   = "handbook"
    ManagedBy = "terraform"
  }
}

variable "web_acl_arn" {
  type        = string
  description = "ARN of a WAFv2 web ACL to attach. Null leaves the distribution without a WAF."
  default     = null
}
