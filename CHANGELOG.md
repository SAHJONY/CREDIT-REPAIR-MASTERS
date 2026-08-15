# Changelog

## 1.1.0 — Autonomous Governance & Observability
- Added structured server-side operation telemetry with request correlation and duration metrics.
- Added a strict no-PII-payload logging policy to telemetry helpers.
- Added Next.js runtime registration instrumentation.
- Added `/api/operations-health` for governance and observability status.
- Extended production operator authentication to every POST surface that can process client context: ChatGPT, agent routing, security guard, policy gateway, workflow start and approvals.
- Added request IDs and audit-friendly failure codes to sensitive operations.

## 1.0.0 — Owner Command Center
- Rebuilt the primary dashboard around the real v1 architecture instead of the original prototype messaging.
- Surfaces the 12-agent workforce, AI safety evals, model budgets, durable workflows, Neon data plane, operator security and launch gates.
- Keeps the Credit Digital Twin, case queue and utilization optimizer in the same executive cockpit.
- Shows configuration status without exposing secret values.
- Makes the external-execution boundary visible at the top of the product.

## 0.9.0 — API Security Boundary
- Added fail-closed operator authentication for sensitive production APIs.
- Added constant-time API token comparison using Node crypto.
- Protected ChatGPT inference, durable workflow start, and workflow approval routes.
- Removed client-supplied reviewer identity from approval decisions; authenticated actor identity is injected server-side.
- Added `/api/security-status` for authentication/readiness visibility.

## 0.8.0 — Neon Data Plane
- Added a real Neon/PostgreSQL PlatformStore adapter with tenant-scoped queries and schema-aware health.

## 0.7.0 — Durable Operations
- Added Vercel Workflow runtime integration, retryable workflows and approval hooks.

## 0.6.0 — Agentic Control Plane
- Added 12 specialized agents, risk routing, security/PII guard, model budgets and safety evals.

## 0.5.0 — Production Foundation
- Added multi-tenant domain models, RBAC, persistence contract and SQL schema.

## 0.4.0 — Agentic Brain Control Plane
- Added bounded tool orchestration, memory, tracing and agent council.

## 0.3.0 — ChatGPT Brain
- Added OpenAI Responses API brain and structured recommendations.

## 0.2.0 — Case OS
- Added cases, evidence, consent, policy gateway and audit model.
