# Company Privacy Practices

Last updated: 2026-04-15

This page is part of the [OSBR Privacy Policy](./privacy-policy). It describes how OSBR handles personal data across its day-to-day business operations.

[[TOC]]

## 1. Client and Business Partner Data

### 1-1. What We Collect

When we engage with clients, vendors, or business partners, we may collect:

- **Contact details**: Names, email addresses, phone numbers, and business addresses of individuals we work with.
- **Project data**: Requirements, design assets, source code, content, and other materials shared in the course of delivering services.
- **Communications**: Emails, chat messages, and meeting notes related to project work.
- **Contractual and billing information**: Scope of work, invoicing details, and payment records.

This data is collected directly from the individuals concerned or from the organisations they represent.

### 1-2. How Client Data Is Handled

Data handling for client engagements is governed by the relevant engagement agreement. The scope of data collected, how it is used, who has access, and how long it is retained are determined by the client's requirements and the terms agreed upon.

In the absence of specific contractual terms:

- Project data is treated as confidential and accessible only to OSBR team members assigned to the engagement.
- Access is managed at the project level and adjusted as team assignments change.
- Client data is not shared with other clients or used for purposes outside the scope of the engagement.

### 1-3. When an Engagement Ends

Upon completion of an engagement, data handling follows the terms of the engagement agreement. Where the agreement is silent:

- Project data is archived and retained for the period required by applicable law (Companies Act 2016, Limitation Act 1953).
- Clients may request deletion of project data, subject to legal retention requirements.
- Client contact details are retained for the purpose of maintaining the business relationship unless the client requests removal.

### 1-4. Client Credentials

Where clients share access credentials (e.g., hosting accounts, API keys) for project purposes, these are stored in appropriate secret management tools and are accessible only to team members who need them. We recommend that clients change shared credentials after an engagement ends.

## 2. Employee and Team Member Data

### 2-1. What We Collect

For current and former team members, we collect and process data as required for employment administration and compliance with applicable law, including:

**During onboarding**:
- Full legal name, contact details (email, phone, address).
- Identification documents (IC number or passport) as required by Malaysian employment law.
- Bank account details for salary disbursement.
- Emergency contact information.
- Employment terms (position, start date, remuneration).

**During employment**:
- Attendance and leave records, as required for payroll processing and compliance with the Employment Act 1955.
- Performance and development records, created through the company's review processes.
- Medical certificates submitted in support of medical leave, as required by the Employment Act 1955.

### 2-2. Access to Team Member Data

| Data category | Accessible to |
| ------------- | ------------- |
| General employment records | Authorised management, HR function |
| Identification and financial details | Authorised management, HR function (restricted access) |
| Attendance and leave records | The team member (own records), authorised management |
| Performance records | The team member (own records), their manager, authorised management |
| Medical certificates | Authorised management, HR function (restricted access) |

Team members may request to review their own records at any time.

### 2-3. Former Team Members

After a team member's departure:

- Employment records are retained for the period required by applicable law (Employment Act 1955, Income Tax Act 1967).
- Access to records is restricted to authorised management.
- Access to internal systems and communication channels is revoked on or before the departure date.

## 3. Recruitment and Candidate Data

### 3-1. What We Collect

When individuals apply for positions at OSBR, we may collect:

- CVs, cover letters, and portfolios submitted by the candidate.
- Interview notes and assessment records created during the recruitment process.
- Contact information provided by the candidate.
- References, where provided or authorised by the candidate.

### 3-2. How We Use It

Recruitment data is used solely for evaluating the candidate's suitability for the role applied for. Candidate data is accessible only to the hiring team involved in the specific recruitment process.

### 3-3. After the Recruitment Process

- **Unsuccessful candidates**: Application materials and assessment records are deleted promptly after the recruitment process concludes. Where a candidate consents to being considered for future opportunities, their data may be retained for a limited period as agreed.
- **Successful candidates**: Recruitment data becomes part of the team member's employment records and is handled accordingly.

Candidates may request deletion of their data at any time by contacting info@osbrjp.com.

## 4. Website Visitor Data

### 4-1. What Google Analytics Collects

The OSBR handbook website uses Google Analytics (GA4) to understand how visitors use our content. Google Analytics collects:

- **Page views and navigation**: Which pages are visited, in what order, and time spent on each page.
- **Session information**: Session start time, duration, and pages viewed per session.
- **Referral source**: How visitors arrived at the site (search engine, direct link, other website).
- **Device and browser information**: Browser type and version, operating system, screen resolution, device category.
- **Geographic region**: General location derived from IP address (country and city level). IP addresses are anonymised by GA4 — OSBR does not receive or store full visitor IP addresses.
- **Engagement metrics**: Scroll depth, outbound link clicks, file downloads.

### 4-2. What Is Not Collected

Google Analytics does not collect names, email addresses, or any directly identifying information. OSBR does not enable GA4 features that would link analytics data to identified individuals:

- Google Signals is not enabled (no cross-device tracking).
- User-ID is not implemented (no individual user tracking across sessions).
- Analytics data is not shared with Google for advertising purposes.

### 4-3. Cookies

The handbook website uses two first-party cookies for analytics:

| Cookie | Purpose | Duration |
| ------ | ------- | -------- |
| `_ga` | Distinguishes unique visitors via a randomly generated ID | 2 years |
| `_ga_*` | Maintains session state | Session duration |

No advertising, remarketing, or third-party tracking cookies are used.

### 4-4. How to Opt Out

You can prevent Google Analytics from collecting your data by:

- Installing the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).
- Blocking cookies from the OSBR handbook domain in your browser settings.

Opting out has no effect on your ability to use the website. The handbook is publicly accessible and does not require sign-in.

### 4-5. Data Retention

Google Analytics data is retained for 2 months (the GA4 default). Analytics data is not exported from Google Analytics or combined with other data sources by OSBR.

## 5. Service User Data

### 5-1. What We Collect

When you use an OSBR software tool (such as the GA4 MCP server), we collect:

- **Email address**: Received from your identity provider (e.g., Google) during sign-in. Used solely to authenticate your session.
- **Authentication event log**: Each sign-in creates a log entry containing your email address, a timestamp, and the outcome. Used for security monitoring. Automatically deleted after 30 days.

### 5-2. What We Do Not Retain

OSBR's software tools are designed so that we do not store, retain, or process the data you access through them. When you use an OSBR tool to retrieve data from a service such as Google Analytics:

- The results are delivered directly to your client application (e.g., an LLM or dashboard).
- No query results, API responses, or analytics data are stored on OSBR's servers — not in databases, on disk, or in logs.
- Your access credentials are held in server memory only for the duration of your session and are discarded when the session ends.

The data you access through OSBR tools remains under your control, in your own accounts, subject to your own data management practices. OSBR does not have independent access to this data outside your authenticated session.

For the technical architecture that enables this, see [Systems Privacy](./privacy-systems).

### 5-3. Revoking Access

You may revoke OSBR's access to your account at any time through your identity provider's settings (e.g., [Google Account permissions](https://myaccount.google.com/permissions)). Revocation takes effect immediately.

## 6. Business Communications

### 6-1. Email

Business emails contain sender and recipient details, message content, and attachments. Emails are retained as part of standard business operations and are not systematically archived beyond what the email service provides.

### 6-2. Chat Messages

Work-related chat messages may contain names, messages, and shared files. Access to communication channels is restricted to current team members and revoked upon departure.

### 6-3. Meeting Records

Meeting invitations contain participant names and email addresses. OSBR does not record audio or video of meetings unless all participants are informed and consent. Where a recording is made, it is retained only for the specific purpose agreed at the time of recording and deleted when no longer needed.

Business communications are used solely for the purpose for which they were shared.

## 7. Vendor and Partner Data

When OSBR engages with vendors, contractors, or other business partners, we collect contact details and contractual information as necessary for the business relationship. Vendor data is used solely for managing the relationship and fulfilling contractual obligations. Vendors and partners have the same data rights as any other data subject.

## 8. Sensitive Personal Data

Section 4 of the PDPA defines sensitive personal data as personal data relating to:

- Physical or mental health
- Political opinions
- Religious beliefs (or other similar beliefs)
- Commission or alleged commission of an offence
- Biometric data (added by the PDPA Amendment Act 2024)

OSBR does not collect sensitive personal data except where explicitly required by applicable law. The only category OSBR collects in the normal course of operations is **health information** — medical certificates submitted in support of medical leave, as required by the Employment Act 1955.

OSBR does not collect political opinions, religious beliefs, criminal records, or biometric data from clients, team members, candidates, or service users. Where sensitive personal data is provided to OSBR incidentally, it is processed only with the data subject's explicit consent in accordance with Section 40 of the PDPA and protected with measures commensurate with its sensitivity.

## 9. Other Information We Do Not Collect

Unless specifically required for employment administration or compliance with applicable law, OSBR does not collect:

- Browsing behaviour or usage analytics tied to identified individuals.
- Payment card or financial account information from clients.
- Social media profiles or personal online activity.
