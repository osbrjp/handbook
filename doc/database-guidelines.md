# Database Guidelines

These guidelines cover how OSBR chooses a data store and structures relational schemas. They are the detailed companion to the [Infrastructure Planning Policy](/infra-planning-policy) — that page sets the high-level principles; this one is the database how-to. The [Technical Glossary](/technical-glossary) defines the underlying terms.

Like the rest of our infrastructure guidance, this leans on the decision guides the large cloud vendors publish and right-sizes them for an SME.

[[TOC]]

## 1. Choosing a Data Store: SQL vs NoSQL

Follow the industry: **default to a relational SQL database, and choose NoSQL only when a concrete requirement makes relational a poor fit.** Most application data is relational, and a good relational database handles the overwhelming majority of workloads.

Structure the decision the way the major vendors do — their decision guides are exactly the kind of big-tech reference an SME can adopt wholesale:

- Microsoft's [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-stores-getting-started) tells you to sort requirements into **functional** (data format — structured / semi-structured / unstructured; OLTP vs OLAP; consistency model; schema-on-write vs schema-on-read; data relationships) and **nonfunctional** (latency and throughput, vertical vs horizontal scale, availability SLA, cost and residency), then let those answers pick the model.
- AWS frames the same split as [relational vs non-relational](https://aws.amazon.com/compare/the-difference-between-relational-and-non-relational-databases/) and offers a [purpose-built decision guide](https://docs.aws.amazon.com/databases-on-aws-how-to-choose/).
- Google Cloud's [database options](https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained) start from data shape and access pattern the same way.

### 1-1. Default to Relational SQL

Reach for SQL (relational) when — which is most of the time:

- Data is **relational**: entities reference each other and you need joins.
- You need **transactions and strong consistency** (ACID) — money, orders, bookings, anything where a half-applied write is unacceptable.
- Query needs are **open-ended**: reporting, ad-hoc queries, or filters you cannot fully predict up front (AWS's cue to stay relational when "query patterns are less predictable").
- **Referential integrity** matters and should be enforced by the database.
- Scale is small-to-large but not extreme — which covers nearly every project we run.

::: tip Default engine: PostgreSQL
For structured SQL, PostgreSQL is the industry default and OSBR's default choice. Prefer a serverless / scale-to-zero flavour where it fits our [scale-to-zero principle](/infra-planning-policy): Cloudflare D1 (SQLite) for small, edge-local, read-heavy data; a serverless Postgres for anything with real relational depth, concurrency, or write load.
:::

### 1-2. Reach for NoSQL Deliberately

Choose a non-relational store only when a specific access pattern or scale requirement pushes you there. Match the *type* of NoSQL to the job, as the vendor decision guides lay out:

| Type | Good for | Examples |
| ---- | -------- | -------- |
| Key-value | Cache, sessions, config, feature flags — access by a single key | Cloudflare KV, DynamoDB, Redis |
| Document | Records whose shape varies; denormalized, read-optimized data accessed by key | DynamoDB, Firestore, MongoDB |
| Object / blob | Files, images, backups, large binaries — *not* a database | Cloudflare R2, S3 |
| Wide-column / other | Extreme write throughput with known, narrow access patterns | Cassandra, Bigtable |

Signs NoSQL is the right call:

- Access patterns are **few, known, and key-based** — you are not running ad-hoc queries.
- You need **massive horizontal scale** or write throughput a single relational primary cannot serve.
- The data is **schema-flexible** or naturally document/blob-shaped.
- **Eventual consistency** is acceptable for the use case.

::: info Don't pick NoSQL for scale you don't have
Choosing NoSQL "to scale" before you have the scale trades away joins, transactions, and query flexibility for a problem you may never hit. Airbnb, at far larger scale than us, kept its primary store on relational MySQL and [scaled it by partitioning](https://medium.com/airbnb-engineering/mysql-in-the-cloud-at-airbnb-336e5666bc94) rather than switching to NoSQL. Start relational, and move specific hot paths to NoSQL when a measured need appears.
:::

### 1-3. Quick Decision Guide

| Consideration | Lean SQL | Lean NoSQL |
| ------------- | -------- | ---------- |
| Relationships & joins | Many | Few / none |
| Transactions & consistency | Strong (ACID) needed | Eventual is fine |
| Query flexibility | Ad-hoc / reporting | Fixed, key-based |
| Schema | Known and stable-ish | Flexible / varies per record |
| Scale pattern | Vertical + read replicas | Extreme horizontal |
| Data shape | Tabular / relational | Document / key-value / blob |

::: tip Polyglot persistence is normal
A single system often uses more than one store: PostgreSQL for core relational data, a key-value store for cache and sessions, and object storage for files. AWS explicitly endorses this [polyglot persistence](https://docs.aws.amazon.com/databases-on-aws-how-to-choose/) — use the right tool per concern rather than forcing everything into one.
:::

## 2. Structuring a SQL Schema: What to Consider

When you do use relational SQL, follow standard industry practice. This section is about the decisions, grounded in the same big-tech guidance.

### 2-1. Model the Domain, Normalize First

- Start **normalized** — aim for third normal form (3NF): store each fact once, reference it with foreign keys, avoid duplicated data. This is Microsoft's baseline [database normalization](https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description) guidance (atomic columns, full-key dependency, no transitive dependencies).
- **Denormalize deliberately and later** — only to solve a *measured* read-performance problem, never pre-emptively.

### 2-2. Keys and Identity

- Give every table a stable **primary key** — Microsoft's [primary and foreign key constraints](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints) guidance: it uniquely identifies each row, cannot be NULL, and is enforced by a unique index. Prefer surrogate keys; keep natural keys as `UNIQUE` constraints.
- Choose the key type on purpose. Google's [Spanner schema-design best practices](https://cloud.google.com/spanner/docs/schema-design) warn against making a **monotonically increasing column** (auto-increment ID, timestamp) the first part of a key, because it creates write **hotspots**; prefer a UUID or hashed key. **UUIDv7 / ULID** give time-ordered, non-enumerable identifiers well suited to distributed and edge systems.

### 2-3. Enforce Invariants in the Database

The database is the last line of defense — do not rely on application code alone.

- Use `NOT NULL`, `UNIQUE`, `FOREIGN KEY`, and `CHECK` constraints to make invalid states unrepresentable; use foreign keys to enforce referential integrity between tables.
- This complements our error-handling stance: a broken invariant should fail loudly, not silently corrupt data.

### 2-4. Types and Precision

- Use the correct type for each column; do not store everything as text.
- **Money**: store as integer minor units or `DECIMAL` — never floating point.
- **Timestamps**: store in UTC with time zone; convert at the edges.
- Use enums or lookup tables for constrained sets rather than free text.

### 2-5. Indexing

- Index for your actual read patterns — the columns in `WHERE`, `JOIN`, and `ORDER BY`.
- Column **order matters** in a composite index; arrange columns to match how your queries filter.
- Every index costs writes and storage. **Add indexes from measured query plans**, not speculatively, and remove unused ones. (Spanner's schema guidance likewise cautions against indexing a monotonic, high-write column.)

### 2-6. OSBR SQL Style (House Decisions)

This is OSBR's SQL style — **decided, not a menu.** It aligns with the [GitLab](https://handbook.gitlab.com/handbook/enterprise-data/platform/sql-style-guide/) and [Mozilla](https://docs.telemetry.mozilla.org/concepts/sql_style.html) style guides where they agree, but the rules below are ours and are what we hold pull requests to. Don't re-litigate them per PR.

- **Identifier casing — strict lowercase `snake_case`** — every identifier (tables, columns, indexes, aliases, CTEs) is lowercase `snake_case`, full stop. No `camelCase`, no `PascalCase`, no capital-leading or `Screaming_Snake_Case` (`User_Name`, `USER_NAME`). PostgreSQL folds unquoted identifiers to lowercase anyway, so mixed-case names only force fragile double-quoting. **Uppercase is reserved for SQL keywords alone** (`SELECT`, `WHERE`, `AS`).
- **Joins** — always spell out the `JOIN` type; never rely on an implicit or comma join.
- **Aliasing** — always alias columns and tables with an explicit `AS`.
- **CTEs over subqueries, for readability** — prefer CTEs for clarity. In mainstream engines a simple CTE and an equivalent subquery usually plan the same, so this is a readability choice, not a performance one.
- **Singular entity, plural table** — a model/entity is singular (`User`); its table is the plural collection (`users`), matching the ActiveRecord / Eloquent convention. Foreign keys are singular + `_id` (`user_id` → `users.id`). Agree the plural of irregular nouns (person → people, status → statuses) up front.
- **Table names mirror the ubiquitous language — so the ubiquitous language itself must be simple.** A table or index name *is* its domain term, not a label to trim independently; the schema mirrors the domain vocabulary one-to-one. But database identifiers are length-limited — PostgreSQL truncates anything past **63 bytes** ([lexical structure](https://www.postgresql.org/docs/current/sql-syntax-lexical.html)), and auto-generated index and constraint names concatenate table and column names, so long base names truncate or collide. **That DB limit constrains the language, not just the name:** agree simple, concise, ideally single-word ubiquitous terms with the domain experts, and short identifiers follow for free. A long, underscore-heavy name means the domain vocabulary is too compound — fix it upstream in the language. Because the name and the term are locked one-to-one, **you cannot shorten a DB identifier without also shortening its ubiquitous-language term**: never abbreviate or mangle the identifier downstream, as that desyncs schema from domain. Drop only mechanical noise: no `tbl_` prefix, no `_table` suffix. Junction tables that must combine two nouns (`user_roles`) are the natural exception.

### 2-7. Migrations and Evolution

- All schema changes go through **versioned, reviewed migration files** — never hand-edited in production.
- Make changes **backward-compatible for zero-downtime deploys**: expand (add the new), migrate data, then contract (remove the old) across separate releases.
- This matches the `🛢️ DB Schema Migration` and `🚑 DB Data Migration` change types in the [Development Guide](/development-guide).

### 2-8. Plan for Access Patterns and Growth

- Know your main queries **before** finalizing the schema; the schema exists to serve them.
- Prefer **keyset (cursor) pagination** over `OFFSET` for large tables.
- Plan archival / retention for data that grows without bound. Introduce partitioning or sharding only when a measured need appears — not by default.

### 2-9. Security and Privacy

- Use **least-privilege** database credentials per service; no shared superuser.
- Encrypt at rest and in transit, per the [Security Policy](/security-policy).
- Minimize stored personal data and keep access to it auditable. Parameterize all queries — never build SQL by string concatenation (see SQLi in the glossary).

## 3. References

Data-store and SQL guidance this page draws on:

**Choosing a data store**

- Azure Architecture Center — choosing a data store — <https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-stores-getting-started>
- AWS — choosing an AWS database service — <https://docs.aws.amazon.com/databases-on-aws-how-to-choose/>
- AWS — relational vs non-relational databases — <https://aws.amazon.com/compare/the-difference-between-relational-and-non-relational-databases/>
- Google Cloud database options — <https://cloud.google.com/blog/topics/developers-practitioners/your-google-cloud-database-options-explained>
- Airbnb Engineering — MySQL in the cloud — <https://medium.com/airbnb-engineering/mysql-in-the-cloud-at-airbnb-336e5666bc94>

**Schema design & SQL style**

- Google Spanner — schema design best practices — <https://cloud.google.com/spanner/docs/schema-design>
- Microsoft — primary and foreign key constraints — <https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints>
- Microsoft — database normalization — <https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description>
- PostgreSQL — lexical structure (identifier limits) — <https://www.postgresql.org/docs/current/sql-syntax-lexical.html>
- PostgreSQL — WITH queries / CTEs — <https://www.postgresql.org/docs/current/queries-with.html>
- GitLab SQL Style Guide — <https://handbook.gitlab.com/handbook/enterprise-data/platform/sql-style-guide/>
- Mozilla SQL Style Guide — <https://docs.telemetry.mozilla.org/concepts/sql_style.html>
