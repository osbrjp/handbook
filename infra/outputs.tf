output "canonical_url" {
  value       = "https://${var.domain_name}/"
  description = "Public address of the handbook once the DNS cutover is enabled."
}

output "certificate_arn" {
  value       = aws_acm_certificate_validation.handbook.certificate_arn
  description = "Validated ACM certificate serving the alias."
}

output "distribution_domain_name" {
  value       = aws_cloudfront_distribution.handbook.domain_name
  description = "CloudFront domain to test against before the DNS cutover."
}

output "distribution_id" {
  value       = aws_cloudfront_distribution.handbook.id
  description = "Distribution ID, for invalidations and CloudWatch metrics."
}
