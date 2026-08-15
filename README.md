# CREDIT REPAIR MASTERS OS

AI-agentic operating system for lawful consumer and business credit improvement workflows.

## Current architecture — v1.2

- Credit Digital Twin and deterministic credit analytics.
- ChatGPT/OpenAI AI Credit CEO using the Responses API.
- 12-agent registry with explicit authority classes, risk ceilings, bounded tools and evidence requirements.
- Risk-aware routing, model/tool budgets, prompt-injection defense and PII minimization.
- Durable Vercel Workflow runtime with approval/resume boundaries.
- Neon/PostgreSQL data-plane adapter with explicit tenant scoping and schema-aware health checks.
- Multi-tenant organization/user/client model, RBAC and audit/agent-run ledgers.
- Case OS, consent ledger, evidence matrix and SHA-256 evidence-metadata fingerprints.
- Deterministic dispute intelligence that blocks accurate negatives, unsupported assertions and identity claims without verified identity evidence.
- Internal AI tool `evaluate_dispute_claim` for evidence-grounded dispute drafting decisions.
- Fail-closed operator authentication for client-context POST APIs.
- Structured observability with request correlation and no PII payload logging.
- Deterministic safety eval suite and independent policy gateway.
- External dispute, payment, new-credit and identity-theft execution remains disabled until verified production gates are satisfied.

## Production release candidate

The current `main` line includes the Neon typing correction using `NeonQueryFunction<false, false>` and upgrades Workflow to the supported `4.2.5` release line. Builds must be executed from the latest `main`; the historical v1.1 preview commit `c93396c` is obsolete and should not be redeployed.

## Run

```bash
cp .env.example .env.local
npm install
npm run check:core
npm run build
npm run dev
```

Set `OPENAI_API_KEY`, `CREDIT_OS_API_TOKEN`, and `DATABASE_URL` only on the server. Never expose them via `NEXT_PUBLIC_*`.

## Key API surfaces

- `GET /api/brain` — deterministic Credit OS snapshot.
- `POST /api/chatgpt-brain` — ChatGPT AI Credit CEO with bounded tool orchestration.
- `GET /api/agents` — specialized agent registry and authority summary.
- `POST /api/agent-router` — risk-aware routing + deterministic workflow plan.
- `POST /api/security-guard` — prompt-injection scan + PII minimization.
- `GET /api/evals` — safety evaluation suite.
- `GET /api/dispute-intelligence` — deterministic dispute eligibility policy.
- `GET /api/evidence-integrity` — case-level evidence matrix and fingerprints.
- `GET /api/storage-health` — Neon connectivity + schema readiness.
- `GET /api/security-status` — operator-auth boundary status.
- `GET /api/operations-health` — governance/observability status.
- `POST /api/workflows/credit-case` — start durable credit-case workflow.
- `POST /api/workflows/credit-case/approval` — resume explicit human approval.
- `POST /api/policy` — independent policy decision.
- `GET /api/readiness` — fail-closed production readiness.

## Authority boundary

ChatGPT and specialist agents may reason, inspect internal state, prioritize, calculate, simulate, and propose. They cannot submit disputes, transfer money, open credit, create identity-theft allegations, fabricate evidence, or bypass consent. Sensitive actions remain governed by deterministic evidence rules, the independent local policy engine, authenticated operator identity and explicit approval workflows.
