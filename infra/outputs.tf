output "canonical_url" {
  value       = "https://${var.domain_name}/"
  description = "Public address of the handbook."
}

output "certificate_arn" {
  value       = aws_acm_certificate_validation.handbook.certificate_arn
  description = "Validated ACM certificate serving the alias."
}

output "distribution_domain_name" {
  value       = aws_cloudfront_distribution.handbook.domain_name
  description = "The distribution's own domain. Answers 301 to canonical_url while enable_dns_cutover is on, so it is only worth testing against with the flag off."
}

output "distribution_id" {
  value       = aws_cloudfront_distribution.handbook.id
  description = "Distribution ID, for invalidations and CloudWatch metrics."
}
