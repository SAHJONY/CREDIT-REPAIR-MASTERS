# Changelog

## 0.5.0 — Production Foundation
- Added multi-tenant organization/user/client domain models.
- Added explicit RBAC permission matrix and fail-closed permission assertion.
- Added PlatformStore persistence contract with demo-memory adapter.
- Added PostgreSQL/Neon-compatible production schema for organizations, users, clients, consent, evidence, audit, and agent-run ledgers.
- Added `/api/clients`, `/api/platform-status`, and `/api/ledger` read-only demo-safe endpoints.
- Upgraded readiness checks so schema/contracts can be ready while live DB/auth/provider integrations remain SETUP.
- Production persistence remains intentionally inactive until a real database adapter and secrets are configured.

## 0.4.0 — Agentic Brain Control Plane
- Upgraded ChatGPT/OpenAI from a single structured reasoning call to bounded multi-round function-tool orchestration.
- Added strict internal tools: snapshot inspection, case inspection, deterministic paydown, and independent policy evaluation.
- Added ephemeral PII-minimized case memory with explicit clear support.
- Added per-run trace events and token-usage capture when reported by OpenAI.
- Added a deterministic three-role council (strategy, evidence, risk) as an independent cross-check.
- Preserved `store:false`; no external executor is exposed to the model.
- Added fail-safe deterministic fallback when OpenAI is missing or fails.
- Added `/api/brain-trace` capability endpoint.

## 0.3.0 — ChatGPT Brain
- Added OpenAI Responses API brain, structured recommendations, server-side configuration, and local policy re-checking.

## 0.2.0 — Case OS
- Added cases, evidence, consent concepts, policy gateway, readiness gate and audit-event model.
