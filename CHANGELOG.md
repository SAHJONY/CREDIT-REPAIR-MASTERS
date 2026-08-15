# Changelog

## 0.8.0 — Neon Data Plane
- Added a real Neon/PostgreSQL `PlatformStore` adapter using the serverless driver.
- Added lazy database activation: no `DATABASE_URL` means demo-memory; no build-time connection attempt is made.
- Made client, consent, evidence, audit, and agent-run storage methods explicitly tenant-scoped by `organizationId`.
- Added tenant mismatch guards on write operations.
- Added `/api/storage-health` to distinguish configured, connected, and production-active persistence states.
- Kept database schema application and production activation fail-closed.

## 0.7.0 — Durable Operations
- Added the official Vercel Workflow runtime integration.
- Added durable credit-case workflows with retryable steps and persisted run state.
- Added type-safe human approval hooks for sensitive credit actions.
- Added workflow start, approval-resume, and run-status APIs.
- Approval never enables direct external execution; approved sensitive work remains marked for manual/controlled execution.
- Wrapped Next.js configuration with the Workflow integration.

## 0.6.0 — Agentic Control Plane
- Added a 12-agent registry with explicit authority, risk ceilings, tool budgets, missions, and evidence requirements.
- Added risk-aware task routing across report, dispute, payment, business-credit, identity, and monitoring workflows.
- Added deterministic workflow plans with security, evidence, policy, approval, blocked, and ready states.
- Added prompt-injection detection and PII minimization before model-bound text is used.
- Added model round/tool/prompt/completion budget guards.
- Added a deterministic agent safety eval suite for dispute evidence, financial consent, identity claims, prompt injection, PII redaction, and external-execution boundaries.
- Added `/api/agents`, `/api/agent-router`, `/api/security-guard`, `/api/evals`, and `/api/agentic-status`.
- Updated Next.js 16 typedRoutes configuration.
- External execution remains disabled; this release strengthens orchestration and verification rather than bypassing approval controls.

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
