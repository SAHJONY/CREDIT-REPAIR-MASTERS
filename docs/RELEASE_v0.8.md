# CREDIT REPAIR MASTERS OS v0.8 — Neon Data Plane

Release purpose: activate a production-grade persistence adapter without allowing database configuration alone to imply production readiness.

## Data plane

- Neon/PostgreSQL serverless adapter.
- Lazy initialization; builds remain safe without `DATABASE_URL`.
- Every client/consent/evidence/audit/agent-run operation is organization-scoped.
- Write operations reject tenant-scope mismatches.
- Storage health distinguishes configured, connected, and schema-ready states.

## Activation rule

Production persistence is active only when a database URL is configured, Neon is reachable, and the required schema tables are present. External credit execution remains disabled regardless of database state.
