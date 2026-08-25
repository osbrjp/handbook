terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Partial configuration: the bucket, key, and region come from a backend
  # config file so no account-specific value is committed. See README.md.
  backend "s3" {}
}
