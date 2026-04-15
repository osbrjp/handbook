# OSBR Privacy Policy

Effective date: 2026-04-15 | Last updated: 2026-04-15

[[TOC]]

## 1. Privacy Statement

OSBR ("we", "us", or "our") is committed to protecting the privacy and personal data of every individual who interacts with our products, services, and operations. We believe that privacy is a fundamental right, and we design our systems and processes with data minimisation at their core.

This policy describes how we collect, use, store, and protect personal information across all OSBR operations. It applies to all tools and services operated by OSBR, regardless of the specific product or platform.

Our services are not directed to individuals under the age of 18. We do not knowingly process personal data of minors.

For more information about OSBR, visit [https://www.osbrjp.com](https://www.osbrjp.com).

## 2. Scope

This policy applies to:

- All OSBR software tools and services.
- All individuals who use, access, or interact with OSBR products.
- All personal data processed by OSBR in the course of its operations.

## 3. Information We Collect

### 3-1. Authentication Information

When you sign in to an OSBR tool using Google OAuth or another authentication provider, we receive basic identity information such as your email address. This information is used solely to authenticate your session.

### 3-2. Authentication Event Logs

We log authentication events, including email addresses and timestamps, for security and operational purposes. These logs help us detect unauthorised access and troubleshoot issues. Authentication event logs are retained for a maximum of 30 days, after which they are deleted.

### 3-3. OAuth Tokens

Our tools use your OAuth tokens to make API requests on your behalf. These tokens are held in server memory only for the duration of your session and are not persisted to disk or any permanent storage.

### 3-4. Server Access Logs

Our application runs on Google Cloud Run. Google Cloud Logging automatically collects HTTP request metadata, including IP addresses, HTTP user agents, and request timestamps. These server access logs are retained for 30 days within Google Cloud Logging and are not used by OSBR for any purpose beyond infrastructure operation and incident investigation.

### 3-5. Cookies and Tracking Technologies

Our tools do not use cookies or similar tracking technologies. Session state is maintained through OAuth tokens held in server memory only.

### 3-6. Information We Do Not Collect

OSBR does not collect, store, or process the following:

- User profiles or personal databases.
- Browsing behaviour or usage analytics tied to individuals.
- Sensitive personal data as defined under Section 4 of the Malaysian PDPA 2010 (e.g., physical or mental health, political opinions, religious beliefs).
- Payment or financial information.

## 4. How We Use Your Information

OSBR tools operate as a **credential passthrough**. This means:

- Your OAuth tokens are used exclusively to make API requests on your behalf.
- API responses are delivered directly to the requesting client (e.g., an LLM or other application). They are not stored, processed, or analysed on our servers.
- We do not build user profiles, maintain a user database, or aggregate personal data across sessions.

Authentication event logs are retained for a maximum of 30 days for security monitoring and operational diagnostics. We process these logs on the basis of legitimate interest in maintaining system security.

The legal basis for each processing activity is summarised below:

| Purpose | Data processed | Legal basis (PDPA) |
| ------- | -------------- | ------------------ |
| Session authentication | Email address, OAuth token | Consent (Section 6) |
| API request fulfilment | OAuth token | Consent (Section 6) |
| Security monitoring | Authentication event logs | Legitimate interest (Section 6(1)) |
| Infrastructure operation | Server access logs (IP, user agent, timestamps) | Legitimate interest (Section 6(1)) |

## 5. Compliance with the Malaysian Personal Data Protection Act 2010

OSBR is committed to complying with the Malaysian Personal Data Protection Act 2010 (PDPA, Act 709). The PDPA establishes seven principles governing the processing of personal data. This section explains how OSBR adheres to each principle.

### 5-1. General Principle (Section 6)

Personal data shall not be processed without the consent of the data subject. OSBR processes personal data only when you actively initiate an authenticated session with one of our tools. By signing in through an authentication provider such as Google OAuth, you provide consent for us to process the minimum information necessary to deliver the service.

Authentication event logs are processed on the basis of legitimate interest in maintaining the security and integrity of our systems. This is permitted under Section 6(1) of the PDPA.

### 5-2. Notice and Choice Principle (Section 7)

A data user shall inform the data subject of the purpose for which personal data is being processed, and shall provide a choice regarding the processing. This privacy policy serves as our written notice under Section 7. In accordance with Section 7(1), we inform you that:

- **Purpose of processing**: We process your data to authenticate your session and to make API requests on your behalf (Section 3 and 4 above).
- **Source of data**: Your authentication information is obtained from your identity provider (e.g., Google) when you sign in.
- **Retention**: Authentication event logs are retained for a maximum of 30 days. OAuth tokens are held for session duration only (Section 7 below).
- **Your rights**: You may access, correct, or request deletion of your data (Section 8 below).
- **Voluntary nature**: Providing your personal data is voluntary. You are not obligated to use our services or to sign in.
- **Consequences of not providing data**: If you choose not to sign in, you will be unable to use OSBR tools that require authentication. No other consequence arises.

You may choose not to use our services at any time, and you may revoke access to your accounts through your authentication provider's settings.

### 5-3. Disclosure Principle (Section 8)

Personal data shall not be disclosed without the consent of the data subject for any purpose other than the purpose for which the data was collected, or a purpose directly related to it. OSBR does not disclose your personal data to any third party, except where:

- Required by Malaysian law or by order of any court.
- Necessary to prevent or detect a crime, or to apprehend or prosecute offenders.
- Required to prevent a serious threat to the life, health, or safety of the data subject or another individual.

We access third-party services (such as Google APIs) using your own credentials and solely on your behalf. This does not constitute disclosure of your data by OSBR.

### 5-4. Security Principle (Section 9)

A data user shall take practical steps to protect personal data from loss, misuse, modification, unauthorised or accidental access, disclosure, alteration, or destruction. OSBR implements the following safeguards:

- OAuth tokens are held in volatile server memory only, with no persistence to disk.
- Authentication event logs are protected by access controls.
- Server infrastructure follows industry-standard security practices.
- Sessions are isolated; one user's credentials cannot be accessed by another.

### 5-5. Retention Principle (Section 10)

Personal data shall not be kept longer than is necessary for the fulfilment of the purpose for which it was collected. OSBR's data retention practices reflect this principle:

| Data type              | Retention period                       |
| ---------------------- | -------------------------------------- |
| OAuth tokens           | Session duration only (memory-held)    |
| Authentication logs    | Maximum 30 days                        |
| Server access logs     | 30 days (Google Cloud Logging default) |
| Google API responses   | Not retained (passed directly)         |
| User profiles/database | Not applicable (none maintained)       |

Once your session ends, tokens held in memory are discarded. Authentication logs and server access logs are deleted after 30 days.

### 5-6. Data Integrity Principle (Section 11)

A data user shall take reasonable steps to ensure that personal data is accurate, complete, not misleading, and kept up to date. Because OSBR does not maintain a user database or store personal profiles, data integrity concerns are minimal. Authentication information is sourced directly from your identity provider (e.g., Google) at the time of each session, ensuring it reflects the current state of your account.

### 5-7. Access Principle (Section 12)

A data subject shall be given access to their personal data and be able to correct that data where it is inaccurate, incomplete, misleading, or not up to date. You may:

- Request information about what authentication logs we hold relating to your account.
- Request correction or deletion of your authentication logs.
- Contact us at info@osbrjp.com to exercise these rights.

We will respond to access requests within 21 days, as prescribed by Section 12(2) of the PDPA. No fee is charged for access requests.

### 5-8. Registration of Data Users (Section 13)

Section 13 requires certain classes of data users to register with the Personal Data Protection Commissioner. OSBR monitors regulatory updates and will register as required should our processing activities fall within a designated class of data users.

## 6. Systems-Specific Privacy Practices

### 6-1. OAuth and Google API Services

OSBR tools that integrate with Google APIs operate under a **credential passthrough model**:

- You authenticate using your own Google account through the standard OAuth consent flow.
- Your OAuth token is used to make API requests on your behalf during your session.
- API responses are returned directly to the requesting client and are not stored, processed, or analysed on our servers. No Google user data is stored server-side at any point.
- Once your session ends, your OAuth token is discarded from server memory.

This model means OSBR does not have independent access to your Google data. All access is mediated by your own credentials and the permissions you grant through Google's consent screen.

#### Google API Scopes

OSBR tools request only the minimum Google API scopes necessary to provide their functionality. The specific scopes requested are presented to you on Google's consent screen before you grant access.

| Tool | Scope | Purpose |
| ---- | ----- | ------- |
| GA4 reporting tools | `analytics.readonly` | Retrieve Google Analytics data on your behalf |

Each scope is used exclusively to perform the actions you request during your session. No broader access is sought or used.

#### Google API Services Limited Use Disclosure

OSBR's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:

- We only use Google API data to provide and improve the user-facing features you interact with.
- We do not transfer Google API data to third parties unless necessary to provide the service, required by law, or with your explicit consent.
- We do not use Google API data for advertising or to build user profiles.
- We do not allow humans to read Google API data except with your consent, for security purposes, to comply with the law, or when data has been aggregated and anonymised for internal operations.

## 7. Data Storage and Retention

| Data type              | Storage location | Retention                        |
| ---------------------- | ---------------- | -------------------------------- |
| OAuth tokens           | Server memory    | Session duration only            |
| Authentication logs    | Server logs      | Maximum 30 days                  |
| Server access logs     | Google Cloud Logging | 30 days                     |
| Google API responses   | Not stored       | Passed directly to client        |
| User profiles/database | Not applicable   | We do not maintain user profiles |

We do not persist OAuth tokens to disk. Once your session ends, tokens held in memory are discarded.

## 8. Your Rights

You have the following rights in relation to your personal data:

- **Access**: Request information about what personal data we hold relating to you.
- **Correction**: Request correction of any inaccurate or incomplete personal data.
- **Deletion**: Request deletion of your authentication logs.
- **Withdrawal of consent**: Stop using our services or revoke access at any time.
- **Revoke Google access**: Remove OSBR's access to your Google account through your [Google Account permissions](https://myaccount.google.com/permissions).

To exercise any of these rights, contact us at info@osbrjp.com. We will respond within 21 days.

## 9. Security

We take reasonable measures to protect your information, including:

- Holding OAuth tokens in volatile memory only, with no disk persistence.
- Logging authentication events for security monitoring.
- Restricting access to authentication logs to authorised personnel.
- Following industry practices for securing server infrastructure.

## 10. International Data Transfers

OSBR services are hosted on Google Cloud Platform (Cloud Run). When you use our tools, your authentication data and OAuth tokens may be processed on servers located outside Malaysia. In such cases, we ensure that appropriate safeguards are in place to protect your data, consistent with Section 129 of the PDPA.

The following third-party infrastructure is involved in delivering our services:

| Third party | Role | Data involved |
| ----------- | ---- | ------------- |
| Google Cloud Platform | Hosts OSBR application servers (Cloud Run), collects server access logs (Cloud Logging) | Authentication logs, server access logs, OAuth tokens (in memory) |
| Google | Identity provider and API service | Email address, OAuth tokens, API request/response data |

When you use our tools to access Google APIs, your data flows directly between your client and Google's servers via your own credentials. OSBR does not independently transfer your Google data to any jurisdiction.

## 11. Data Breach Notification

In the event of a personal data breach that affects your information, OSBR will:

- Investigate the breach promptly and take steps to contain it.
- Notify affected individuals without unreasonable delay.
- Report the breach to the Personal Data Protection Commissioner where required by law.

## 12. Changes to This Policy

We may update this policy from time to time. When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.

## 13. Governing Law

This policy is governed by and construed in accordance with the laws of Malaysia, including the Personal Data Protection Act 2010 (Act 709).

## 14. Contact

If you have questions or concerns about this privacy policy or wish to exercise your rights under the PDPA, please contact us at info@osbrjp.com.

Company registration details and physical address are available at [https://www.osbrjp.com](https://www.osbrjp.com).
