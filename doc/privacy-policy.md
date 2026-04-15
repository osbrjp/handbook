# OSBR Privacy Policy

Last updated: 2026-04-15

[[TOC]]

## 1. Introduction

OSBR ("we", "us", or "our") is committed to protecting the privacy of individuals who use our software tools and services. This policy describes how we handle personal information across all OSBR products and services. It applies to all tools and services operated by OSBR, regardless of the specific product or platform.

For more information about OSBR, visit [https://www.osbrjp.com](https://www.osbrjp.com).

## 2. Information We Collect

### 2-1. Authentication Information

When you sign in to an OSBR tool using Google OAuth or another authentication provider, we receive basic identity information such as your email address. This information is used solely to authenticate your session.

### 2-2. Authentication Event Logs

We log authentication events, including email addresses and timestamps, for security and operational purposes. These logs help us detect unauthorized access and troubleshoot issues.

### 2-3. OAuth Tokens

Our tools use your OAuth tokens to make API requests on your behalf. These tokens are held in server memory only for the duration of your session and are not persisted to disk or any permanent storage.

## 3. How We Use Your Information

OSBR tools operate as a **credential passthrough**. This means:

- Your OAuth tokens are used exclusively to make API requests on your behalf.
- API responses are delivered directly to the requesting client (e.g., an LLM or other application). They are not stored, processed, or analyzed on our servers.
- We do not build user profiles, maintain a user database, or aggregate personal data across sessions.

Authentication event logs are retained only for security monitoring and operational diagnostics.

## 4. Data Storage and Retention

| Data type              | Storage location | Retention                        |
| ---------------------- | ---------------- | -------------------------------- |
| OAuth tokens           | Server memory    | Session duration only            |
| Authentication logs    | Server logs      | Retained for operational needs   |
| Google API responses   | Not stored       | Passed directly to client        |
| User profiles/database | Not applicable   | We do not maintain user profiles |

We do not persist OAuth tokens to disk. Once your session ends, tokens held in memory are discarded.

## 5. Third-Party Services

Our tools integrate with third-party platforms, including Google APIs, to provide functionality on your behalf. We access these services using your own credentials and do not share your data with any additional third parties.

## 6. Google API Services Limited Use Disclosure

OSBR's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:

- We only use Google API data to provide and improve the user-facing features you interact with.
- We do not transfer Google API data to third parties unless necessary to provide the service, required by law, or with your explicit consent.
- We do not use Google API data for advertising or to build user profiles.
- We do not allow humans to read Google API data except with your consent, for security purposes, to comply with the law, or when data has been aggregated and anonymized for internal operations.

## 7. Security

We take reasonable measures to protect your information, including:

- Holding OAuth tokens in volatile memory only, with no disk persistence.
- Logging authentication events for security monitoring.
- Following industry practices for securing server infrastructure.

## 8. Your Rights

You may:

- Revoke access to your Google account at any time through your [Google Account permissions](https://myaccount.google.com/permissions).
- Request information about what authentication logs we hold relating to your account.
- Request deletion of your authentication logs by contacting us.

## 9. Changes to This Policy

We may update this policy from time to time. When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.

## 10. Contact

If you have questions or concerns about this privacy policy, please contact us at contact@osbrjp.com.
