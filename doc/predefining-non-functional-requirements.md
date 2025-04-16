# Non-functional Requirements

In the development process, it is necessary to define non-functional and functional requirements. Functional requirements are deep-rooted in the specific things that a system needs to be able to do. What about non-functional requirements? (NFRs)

[[TOC]]

## 1. What are NFRs?

Unlike functional requirements, NFRs describe the quality, performance, and constraints of a system rather than specific features or behaviors.
They set criteria for the system's operational characteristics, covering aspects like performance, security, usability, and reliability.

While functional requirements ensure a system works, NFRs ensure it works well in real-world conditions. Without NFRs, a system may technically function but fail to satisfy users, business goals, or legal standards.

::: tip NOTE
A system might "work" without meeting NFRs, but it could fail to meet business needs or user expectations, making it practically unusable in real life. So even though they’re sometimes seen as "secondary," NFRs are crucial for real-world success.
:::

## 2. Examples of NFRs

Here are some common categories of NFRs with practical examples:

### 2-1. Performance

The performance defines the speed and responsiveness of the system.

#### Examples:

- The search engine must return search results within 2 seconds.
- A website should handle 1,000 concurrent users without performance degradation.
- The homepage must load in under 3 seconds on a 4G connection.

### 2-2. Security

It specifies how the system should protect data and resist outside threats.

#### Examples:

- All sensitive data must be encrypted at rest and in transit.
- To protect sensitive information, users must re-authenticate after 30 minutes of inactivity.
- The server must block access after 5 failed login attempts.

### 2-3. Usability

Ensures the system is intuitive and easy to use, especially for non-technical users.

### Examples:

- All interactive elements must be keyboard navigable.
- System must comply with [WCAG 2.1 AA accessibility standards.](https://www.w3.org/TR/WCAG21/)
- User onboarding should take less than 5 minutes with guided walkthroughs.

### 2-4. Reliability

The reliability ensures the system runs without failure, even under stress.

#### Examples:

- The service should maintain 99.95% uptime.
- Scheduled maintenance should be limited to one hour per month.
- Automatic failover should engage within 30 seconds of a service disruption.

### 2-5. Maintainability

This describes how easily the system can be updated or fixed.

#### Examples:

- All code must follow internal coding guidelines and be reviewed before merging.
- New releases must be backward compatible with the last two versions.
- Critical bugs should be fixable and deployable within 24 hours.

### 2-6. Scalability

Focuses on how well the system can handle growth.

#### Examples:

- A website should support scaling up to 100,000 daily users without significant performance drops.
- The infrastructure must allow horizontal scaling of backend services.
- Database should handle 10 million records efficiently.

### 2-7. Compliance

The system should adhere to laws, regulations, and industry standards.

#### Examples:

- System must comply with [GDPR](https://gdpr-info.eu/) for data privacy.
- Financial transactions must meet [PCI DSS standards.](https://www.pcisecuritystandards.org/standards/)
- All personal data access must be auditable for insurance compliance.

## 3. Why are NFRs Important?

NFRs are essential for success beyond "making it work".

Here’s why:

| Aspect               | Why It Matters                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| User Experience (UX) | Poor usability or slow response times will drive users away.                                      |
| Security             | Without NFRs, systems are vulnerable to attacks, risking data breaches and compliance violations. |
| Reliability          | Businesses need stable and dependable services that won't crash under traffic spikes.             |
| \*Cost Management    | NFRs guide scalable and maintainable design, preventing future technical debt.                    |
| Reputation           | Failure to meet expectations can damage brand reputation and customer trust.                      |

As shown above, NFRs are not just extras to have. They are essential for delivering a product that users love, businesses can rely on, and teams can maintain over time.

## 4. Common Mistakes with NFRs

### 4-1. Ignoring NFRs

Teams often focus solely on functional requirements, leaving NFRs as an afterthought. This can lead to:

- Slow, unusable systems.
- Major rework during late stages.
- Angry users and clients.

### 4-2. Vague or Unmeasurable NFRs

Writing "The system should be fast" is meaningless unless "fast" is defined. NFRs must be quantifiable and specific.

| Good Example                                               | Bad Example                        |
| ---------------------------------------------------------- | ---------------------------------- |
| The system must return responses within 500 ms under load. | The system should respond quickly. |

### 4-3. Conflicting NFRs

Some NFRs might conflict if not analyzed together:

1. Security vs Usability

   - Making login too strict can frustrate users.

2. Performance vs Cost
   - High performance may demand costly infrastructure.

::: tip Solution:
Balance priorities and involve stakeholders in trade-off discussions.
:::

## 5. How to Define Good NFRs

### 5-1. Make Them Specific and Measurable

NFRs should be clear, actionable, and testable. Vague statements like "The system should be fast" or "The system should be secure" are not helpful because they leave too much room for interpretation. Instead, a good NFR should describe exactly what is expected and how success will be measured. This makes it easier for engineers to design and build the system properly, and for stakeholders to validate if their expectations are met.

#### Example:

- System must handle 500 concurrent users with a response time under 1 second.

### 5-2. Align with Business Goals

NFRs should directly reflect stakeholder expectations and business objectives. A system that performs well technically but fails to meet business goals is still a failed system. By aligning NFRs with what the business and users actually need, teams ensure that the system delivers real value and supports broader organizational priorities.

#### Consider:

- User satisfaction.
- Regulatory compliance.
- Market competitiveness.

### 5-3. Prioritize NFRs

In real-world projects, it’s rarely possible to optimize for every single NFR at once. Some trade-offs will be necessary. This makes prioritization critical. Focus on what matters most to the business and users. Consider which requirements will have the biggest impact on success, and which ones might be deferred or scoped down.

#### Consider:

- Business impact.
- User expectations.
- Cost and feasibility.

### 5-4. Document and Communicate

Defining NFRs is only part of the process. They also need to be clearly documented and shared across all relevant teams. Without good communication, important NFRs can get lost in translation, leading to gaps in delivery.

#### Best Practices:

- Record NFRs clearly during project planning.
- Share them across teams: engineering, design, QA, and stakeholders.
- Revisit and adjust as the project evolves.
