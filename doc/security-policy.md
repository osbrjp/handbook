Security Policy Standards
========================

This document outlines the security measures required of developers participating in development projects. All developers, including external collaborators, must comply with the standards set forth in this document upon joining a project.

[[TOC]]


Security Measures Required of Developers
-----------------------------

Developers and collaborators must adhere to the following:

### 1. Mandatory Code Review by a Security-Knowledgeable Reviewer

Pull requests must be reviewed and approved by someone with sufficient knowledge of secure development practices. The reviewer should be capable of identifying common security risks and ensuring that the code meets appropriate security standards.

### 2. Understanding of Web Security Fundamentals

All developers must understand web security basics, including secure coding, common attack methods, and how to prevent them. This knowledge should match the level of the OWASP Top 10.

### 3. Mandatory Security Training

Collaborators must complete company-designated security training before joining any project.

### 4. Prohibition of Working in Public Spaces

**Working in public spaces is strictly prohibited.** Development work may not be performed in cafés, open coworking spaces, trains, airports, or any other public locations. Working from home is permitted.

### 5. Prohibition of Project-Related Conversations in Public

Conversations regarding project matters in public places—such as while commuting or dining—are strictly prohibited. Examples include questions like "What happened with Project X?" that reveal project or client names. Even if such conversations do not directly result in information leakage, they can severely damage trust.

### 6. Prohibition on Referring to Other Clients During Meetings

When discussing other clients during meetings, references must be limited to publicly available information. Even if NDAs are in place, discussions about other clients' projects are not allowed.

### 7. Prohibition of Public Disclosure of Achievements

Unless client approval is obtained, disclosing project achievements is strictly prohibited. This includes:

* Posting on personal blogs or platforms such as Dev.to
* Sharing on social media platforms such as X
* Presentations at seminars or conferences
* Publishing on collaborators’ websites without permission
* Detailed descriptions on résumés for job applications
    * Please redact client and service names and describe responsibilities in general terms

Security Measures for Devices
-----------------------------

Developers and collaborators must implement the following measures on all work-related devices:

### 1. Prohibition of Using Small External Storage Devices

Using small USB drives or similar devices to handle project data is prohibited.

### 2. Auto Sleep and Reauthentication Requirement

Devices must be configured to enter sleep mode within five minutes of inactivity, and reauthentication must be required upon wake.

### 3. Malware Protection for Windows Devices

* Malware protection is mandatory for Windows devices (e.g., Microsoft Defender).
* For Mac and Linux, anti-malware software is recommended.

### 4. Prohibition of Storing Files on Desktop

Files must not be stored permanently on the desktop. The desktop may only be used as a temporary workspace, and all files must be deleted after use.

### 5. No Project/Client Names on Browser Bookmark Bars

To prevent unintended disclosure during screen sharing or screenshots, project or client names must not be visible on browser bookmark bars.

### 6. Deletion of Project Files Upon End of Engagement

Collaborators must delete all project-related documents and source code upon leaving a project.

### 7. No Use of Self-Hosted Development Servers

Developers may not clone repositories or create container environments on self-hosted servers for development over the internet. Development must occur only on local machines, GitHub Codespaces, or company-provided servers.

### 8. Proxy Settings for Staging/Production Access

Since staging and production environments are IP-restricted, developers must configure proxies to access them through company-provided servers.

### 9. Use of Screenshot Tools with Masking Capabilities

Only screenshot tools with masking features should be used.

### 10. No Screen Sharing of Communication Tools

During online meetings (e.g., Google Meet or Zoom), do not share screens showing tools like Gmail or Slack to avoid exposing contact lists or sensitive messages.

### 11. No Publicly Accessible File Sharing

Do not use file sharing services (e.g., Google Drive) that allow access simply by knowing the URL. Google Workspace settings must also reflect this policy.

### 12. Mandatory Full Disk Encryption

All work devices must use full disk encryption (e.g., BitLocker for Windows, FileVault for Mac).

### 13. Enable Remote Wipe

Devices must be configured to allow remote wiping in case of loss or theft.

### 14. Use of Password Managers

All employees must use Google Password Manager to securely manage and store their passwords, and to prevent password reuse.

Security Measures for Accounts
-----------------------------

The following security policies apply to all services used by developers:

* GitHub  
* Slack  
* Google Workspace  
* Cloud infrastructure (e.g., AWS, GCP)  
* Third-party services (e.g., Cloudflare, SendGrid)

### 1. Enforced Use of Passkeys or Multi-Factor Authentication

Authentication using only ID and password is prohibited. Passkeys or MFA must be enabled.

### 2. Prohibition on Long-Term, High-Privilege Access Keys

Avoid issuing long-lived credentials such as AWS Access Keys or GitHub PATs. Instead:

* **For local use**: Use AWS Organizations SCP with MFA enforcement or AWS Identity Center.
* **For CI/CD**: Use OpenID Connect.
* **For server-side use**: Assign IAM roles directly to resources.

### 3. Prohibition on Committing Credentials

Never commit API keys or other credentials to repositories. If credentials are committed, they must be revoked immediately.

### 4. Share Credentials via Direct Message Only

Do not share sensitive information in public or group channels. Send via DM and delete after confirmation of receipt.

### 5. No Use of External CI/CD Integrations

Use of third-party CI/CD tools with private repositories is not permitted.

### 6. No Sharing of Screenshots Containing Personal Data

Do not share screenshots containing personal data in GitHub issues, pull requests, or public channels. If necessary, apply appropriate masking.

### 7. Regular Access Review  
  Review user access rights on a quarterly basis and remove unnecessary permissions.

Security Measures for Workloads
-----------------------------

<!-- TODO: Create the Application Design Guidelines page at /development/application -->
Security measures for applications and their runtime environments are defined in the Application Design Guidelines.

Appendix 1: Protected Assets
-----------------------------

All information assets related to the project are subject to protection.

::: info Examples of Protected Assets
* Source code, documentation, related files, and associated accounts
* Databases and files uploaded by users
* Access logs, metrics, and other operational logs
* Emails and communication history on platforms like GitHub and Slack
* Screenshots
:::

Appendix 2: Risk Assumptions
-----------------------------

Projects must take precautions against the following risk categories:

### 1. Accidents and Human Errors

Risks related to developer errors or natural disasters are taken into account.

::: info Examples of Accidents and Human Errors
* Sending an email to an unintended recipient
* Directly executing SQL and accidentally deleting critical data
* Work disruption or infrastructure failure due to natural disasters
:::

### 2. External Attacks

Two main categories of external threats are considered:
(1) attacks driven by financial motives, and
(2) attacks aimed at damaging reputation.

::: info Examples of Financially Motivated Attacks
* Stealing authentication credentials to perform unauthorized cryptomining, phishing, or sending spam
* Exploiting misconfigurations to deploy ransomware and demand ransom payments
* Gaining unauthorized access to retrieve advantageous information not available to regular users
* Selling stolen personal information to third parties after breaching the system or obtaining admin credentials
:::

::: info Examples of Reputation-Damaging Attacks
* Destroying the system after stealing authentication credentials
:::

### 3. Insider Threats

Internal threats include:
(1) attacks driven by personal financial gain, and
(2) attacks aimed at damaging the reputation of either the client or the development team.

::: info Examples of Financially Motivated Insider Attacks
* Using company infrastructure to perform unauthorized cryptomining
* Leaking internal or client-side privileged information for external gain
* Stealing and selling personal data by breaching admin systems or using compromised credentials
:::

::: info Examples of Reputation-Damaging Insider Attacks
* Intentionally destroying the system
* Tampering with service content by developers or internal users
:::
