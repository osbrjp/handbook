# Legal Compliance — Malaysian PDPA 2010

Last updated: 2026-04-15

This page is part of the [OSBR Privacy Policy](./privacy-policy). It documents how OSBR complies with each of the seven data protection principles established by the Malaysian Personal Data Protection Act 2010 (PDPA, Act 709), plus the registration requirements under Section 13.

[[TOC]]

## Overview

The PDPA establishes seven principles governing the processing of personal data in Malaysia. These principles apply to all personal data processed by OSBR — whether it relates to clients, team members, job candidates, website visitors, service users, or business partners. OSBR processes all personal data in accordance with these principles and applicable Malaysian law.

## 1. General Principle (Section 6)

**What the law requires**: Personal data shall not be processed without the consent of the data subject, unless an exemption under Section 6(1) applies.

**How OSBR complies**: OSBR obtains consent appropriate to each context:

- **Clients and partners**: Consent is established through the contractual relationship. Engagement agreements define the scope of data processing. Data is not processed for purposes beyond the agreed scope without further consent.
- **Team members**: Consent is obtained through the employment agreement, which describes the categories of data processed and the purposes. Processing required for compliance with employment law does not require separate consent under the PDPA.
- **Candidates**: By submitting a job application, candidates consent to processing of their data for recruitment purposes.
- **Website visitors**: Analytics cookies are non-essential. Visitors may opt out at any time using the methods described in [Company Privacy Practices — Section 4-4](./privacy-company#_4-4-how-to-opt-out).
- **Service users**: By signing in through an identity provider (e.g., Google OAuth), users consent to processing of the information necessary to deliver the service. The identity provider's consent screen describes the specific permissions being granted.

**Legitimate interest**: Where data is processed on the basis of legitimate interest (e.g., security monitoring, infrastructure operation, website analytics), this is permitted under Section 6(1) of the PDPA. OSBR applies legitimate interest only where the processing is proportionate and does not override the data subject's rights.

## 2. Notice and Choice Principle (Section 7)

**What the law requires**: A data user shall inform the data subject, by written notice, of the purpose of processing, the source of the data, the data subject's rights, and other matters specified in Section 7(1).

**How OSBR complies**: The [OSBR Privacy Policy](./privacy-policy) and this supporting documentation serve as our written notice under Section 7. In accordance with Section 7(1):

### 2-1. Section 7(1) Disclosures

**(a) Purpose of processing**: We process personal data for the purposes described in [Privacy Policy — Section 4](./privacy-policy#_4-how-we-use-your-information).

**(b) Description of data**: The categories of personal data we collect are described in [Company Privacy Practices](./privacy-company).

**(c) Source of data**: Personal data is obtained from:
- The data subject directly (contact details, applications, sign-ins).
- The organisation the data subject represents (client engagements).
- Identity providers (e.g., Google) during authentication.

**(d) Right to access and correct**: Data subjects have the right to access and correct their personal data. The process is described in Section 7 of this page.

**(e) Classes of third parties**: Third parties who may process data on OSBR's behalf are described in [Privacy Policy — Section 10](./privacy-policy#_10-international-data-transfers).

**(f) Whether providing data is obligatory or voluntary**: Providing personal data to OSBR is voluntary. No one is obligated to become a client, apply for a job, visit our website, or use our tools.

**(g) Consequences of not providing data**:
- *Clients*: We may be unable to deliver services without the necessary information.
- *Team members*: Certain data is required for compliance with employment law; without it, we cannot fulfil our legal obligations as an employer.
- *Candidates*: We cannot process a job application without the candidate's information.
- *Service users*: Authentication is required to use tools that access third-party APIs on your behalf.
- *Website visitors*: Opting out of analytics has no effect on website functionality.

### 2-2. Additional Notice

Beyond this policy, OSBR provides notice through:

- Employment agreements and onboarding documentation for team members.
- Engagement agreements for clients, where applicable.
- Identity provider consent screens for service users.
- Notification to team members when new internal tools that process personal data are introduced.

### 2-3. Withdrawal of Consent

You may withdraw consent at any time by contacting info@osbrjp.com. Withdrawal does not affect the lawfulness of processing carried out before the withdrawal. Specific withdrawal mechanisms:

- **Service users**: Revoke access through your [Google Account permissions](https://myaccount.google.com/permissions).
- **Website visitors**: Opt out of analytics using browser settings or the [Google Analytics Opt-out Add-on](https://tools.google.com/dlpage/gaoptout).
- **Candidates**: Request deletion of application data by emailing info@osbrjp.com.

## 3. Disclosure Principle (Section 8)

**What the law requires**: Personal data shall not be disclosed for any purpose other than the purpose for which it was collected, or a directly related purpose, without the consent of the data subject.

**How OSBR complies**: OSBR does not sell, rent, or trade personal data. Personal data may be disclosed only where:

- Required by Malaysian law or by order of any court.
- Necessary to prevent or detect a crime, or to apprehend or prosecute offenders.
- Required to prevent a serious and imminent threat to the life, health, or safety of any individual.
- Necessary for the performance of a contract to which the data subject is a party, as specified in the relevant agreement.

OSBR uses third-party infrastructure services (Google Cloud Platform, Google Analytics) to deliver its services. These providers process data on OSBR's behalf as data processors. OSBR remains responsible for the data under the PDPA.

When OSBR tools access third-party APIs (e.g., Google Analytics Data API), they do so using the user's own credentials. This is a passthrough operation — OSBR is not disclosing the user's data to the third party.

## 4. Security Principle (Section 9)

**What the law requires**: A data user shall take practical steps to protect personal data from loss, misuse, modification, unauthorised or accidental access, disclosure, alteration, or destruction.

**How OSBR complies**: OSBR implements appropriate technical and organisational measures proportionate to the sensitivity of each category of data:

- **Access control**: Personal data is accessible only to authorised personnel with a demonstrated need. Access is adjusted as roles change and revoked when no longer needed.
- **Data segregation**: Sensitive data (identification documents, financial details) is stored with restricted access separate from general records. Client project data is segregated by engagement.
- **Service user data**: OAuth tokens are held in volatile server memory only, with no persistence to disk. Sessions are isolated from each other.
- **Communications**: Business communications are conducted through services that provide encryption in transit.
- **Infrastructure**: Administrative access to cloud infrastructure is appropriately secured.

## 5. Retention Principle (Section 10)

**What the law requires**: Personal data shall not be kept longer than is necessary for the fulfilment of the purpose for which it was collected.

**How OSBR complies**: Retention periods are determined by the purpose of processing and applicable legal requirements:

| Data type | Retention | Basis |
| --------- | --------- | ----- |
| Client and project data | As specified in engagement agreement, subject to applicable law | Contractual, Companies Act 2016, Limitation Act 1953 |
| Team member records (general) | Duration of employment plus period required by law | Employment Act 1955 |
| Payroll and tax records | Duration of employment plus 7 years | Income Tax Act 1967 |
| Medical certificates | Duration of employment plus period required by law | Employment Act 1955 |
| Recruitment data | Deleted promptly after process concludes, unless consent given | PDPA Section 10 |
| Website analytics | 2 months (GA4 default) | PDPA Section 10 |
| OAuth tokens | Session duration only (server memory) | Technical architecture |
| Authentication event logs | 30 days (Cloud Logging) | Infrastructure default |
| Server access logs | 30 days (Cloud Logging) | Infrastructure default |
| Google API responses | Not retained | Passthrough architecture |
| Business communications | As required for business operations and applicable law | Business necessity |

When retention periods expire, data is deleted or irreversibly anonymised in accordance with applicable law. Data subjects may request early deletion, subject to any legal retention requirements. Where a legal requirement prevents deletion, we will inform the data subject of the basis.

## 6. Data Integrity Principle (Section 11)

**What the law requires**: A data user shall take reasonable steps to ensure that personal data is accurate, complete, not misleading, and kept up to date.

**How OSBR complies**:

- **Client and partner data**: Contact details are updated through ongoing business communications. Clients may request a review of data held about them at any time.
- **Team member data**: Team members are encouraged to notify management of changes to their personal information. Records are maintained through regular HR processes.
- **Recruitment data**: Candidate data is used as-submitted. If a candidate provides updated information, the new version replaces the previous one.
- **Authentication data**: Sourced directly from the identity provider at the time of each session, ensuring it reflects the current state of the account.

If you believe any personal data we hold about you is inaccurate or incomplete, you may request correction by contacting info@osbrjp.com.

## 7. Access Principle (Section 12)

**What the law requires**: A data subject shall be given access to their personal data and be able to correct that data where it is inaccurate, incomplete, misleading, or not up to date.

### 7-1. How to Submit a Request

You may request access to, correction of, or deletion of your personal data by emailing info@osbrjp.com with the subject line "Personal Data Access Request." To help us locate your data, please include:

- Your full name.
- The email address(es) associated with your interactions with OSBR.
- Your relationship with OSBR (e.g., client, team member, candidate, service user).
- A description of the data you wish to access, correct, or delete.

### 7-2. What to Expect

We will verify your identity before disclosing personal data. We will respond to access requests within 21 days, as prescribed by Section 12(2) of the PDPA.

If we are unable to fulfil a request — for example, because the data has already been deleted or a legal exemption applies — we will explain the reason.

### 7-3. Fees

No fee is charged for data access, correction, or deletion requests.

### 7-4. Team Member Access

Team members may request to review their own records at any time without submitting a formal data access request.

### 7-5. Complaints

If you are unsatisfied with our handling of your data or our response to a request, you may lodge a complaint with the Personal Data Protection Commissioner of Malaysia.

## 8. Registration of Data Users (Section 13)

**What the law requires**: Certain classes of data users, as specified by the Minister through gazette notification, must register with the Personal Data Protection Commissioner before processing personal data.

**How OSBR complies**: OSBR monitors regulatory updates and gazette notifications. If our processing activities fall within a designated class, we will register and comply with all applicable conditions.
