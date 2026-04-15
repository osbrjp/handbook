# Systems Privacy

Last updated: 2026-04-15

This page is part of the [OSBR Privacy Policy](./privacy-policy). It describes the technical architecture of OSBR's software tools and infrastructure — how they are built, how data flows through them, and why this architecture minimises the personal data OSBR handles.

For information about what data OSBR collects and how it is used across all business operations, see [Company Privacy Practices](./privacy-company).

[[TOC]]

## 1. OAuth and Google API Services

### 1-1. Credential Passthrough Architecture

OSBR tools that integrate with Google APIs are built on a **credential passthrough** architecture. This is a deliberate design choice that ensures OSBR does not store or have independent access to users' data:

1. **Authentication**: The user signs in with their own Google account through the standard OAuth 2.0 consent flow.
2. **Token issuance**: Google issues an OAuth token authorising the OSBR tool to make specific API requests on the user's behalf.
3. **API request**: The tool uses the token to call Google APIs (e.g., the Google Analytics Data API).
4. **Response delivery**: API responses are returned directly to the user's client application (e.g., an LLM or dashboard). Responses are not stored, logged, cached, or processed on OSBR's servers.
5. **Session end**: The OAuth token is discarded from server memory. No persistent record of the token or the data accessed is retained.

### 1-2. Data Flow

| Step | Data location | Persistence |
| ---- | ------------- | ----------- |
| User signs in via Google OAuth | Google's servers | Google manages |
| OAuth token received by OSBR tool | OSBR server memory (volatile) | Session duration only |
| API request sent to Google | In transit | None |
| API response received | In transit | None — delivered directly to user's client |
| Session ends | Token discarded from memory | Nothing retained |

### 1-3. Google API Scopes

A "scope" defines what data a tool can access and what actions it can perform. OSBR tools request only the minimum scopes necessary for their functionality. The scopes are presented on Google's consent screen before access is granted.

| Tool | Scope | What it permits |
| ---- | ----- | --------------- |
| GA4 reporting tools | `analytics.readonly` | Read Google Analytics reports and configuration |

Scopes are used exclusively to perform the actions the user requests during their session. If new tools are added that require additional scopes, this table will be updated and users will see the new permissions on Google's consent screen.

### 1-4. Google API Services Limited Use Disclosure

OSBR's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:

- We only use Google API data to provide and improve the user-facing features you interact with.
- We do not transfer Google API data to third parties unless necessary to provide the service, required by law, or with your explicit consent.
- We do not use Google API data for advertising or to build user profiles.
- We do not allow humans to read Google API data except with your consent, for security purposes, to comply with the law, or when data has been aggregated and anonymised for internal operations.

### 1-5. Authentication Event Logs

Each sign-in creates a log entry containing:

- The user's email address (as provided by Google during OAuth).
- A timestamp.
- The authentication outcome (success or failure).

These logs are used for security monitoring and are automatically deleted after 30 days by Google Cloud Logging. They are not exported or combined with other data sources.

### 1-6. What the OAuth System Does Not Collect

OSBR's OAuth-based tools do not collect or have access to:

- The user's Google password.
- Google account details beyond the email address (profile, contacts, calendar, etc.).
- The content of the user's Google Drive, Gmail, or other Google services.
- Any data outside the specific API scopes granted.

## 2. Internal Tools

### 2-1. Attendance Tracking

OSBR uses an internal tool for attendance tracking. This tool records:

- Team member identity.
- Sign-in and sign-out timestamps.

This data supports payroll processing and compliance with the Employment Act 1955. Access is restricted to the team member (their own records) and authorised management.

### 2-2. New Tool Introduction

When new internal tools that process personal data are introduced, team members are informed of the tool's purpose, the data it processes, and who has access. This page is updated to reflect new tools.

## 3. Server Infrastructure

### 3-1. Google Cloud Run

OSBR's software tools are deployed on Google Cloud Run, a serverless container platform. Key characteristics relevant to privacy:

- **Stateless**: Container instances do not retain state between requests beyond the in-memory session. OAuth tokens held in memory are discarded when the instance is recycled.
- **No persistent storage**: OSBR's Cloud Run deployments do not use persistent disks or databases for user data.
- **Automatic scaling**: Instances are created and destroyed based on demand. When an instance is destroyed, all data in its memory is permanently lost.

### 3-2. Google Cloud Logging

Google Cloud Logging automatically collects HTTP request metadata for requests to OSBR's Cloud Run services:

| Field | Description |
| ----- | ----------- |
| IP address | Client IP address |
| HTTP user agent | Browser or client identifier |
| Request timestamp | When the request was received |
| Request path and method | URL path and HTTP method |
| Response status code | Success or failure indicator |

Server access logs are retained for 30 days within Google Cloud Logging and then automatically deleted. OSBR uses these logs for infrastructure operation (capacity monitoring, error diagnosis) and security incident investigation.

### 3-3. Third-Party Infrastructure Summary

| Service | Provider | Purpose | Data processed | Retention |
| ------- | -------- | ------- | -------------- | --------- |
| Application hosting | Google Cloud Run | Runs OSBR software tools | OAuth tokens (in memory), request metadata | Session (memory), 30 days (logs) |
| Server logging | Google Cloud Logging | HTTP request metadata collection | IP address, user agent, timestamps, paths | 30 days |
| Identity provider | Google (OAuth 2.0) | User authentication | Email address, OAuth tokens | Session duration |
| API services | Google APIs | Provides data requested by users | API request/response data (in transit only) | Not retained by OSBR |
