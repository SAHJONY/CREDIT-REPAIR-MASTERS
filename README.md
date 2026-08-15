# CREDIT REPAIR MASTERS OS

AI-agentic operating system for lawful consumer and business credit improvement workflows.

## Current architecture — v0.6

- Credit Digital Twin and deterministic credit analytics.
- ChatGPT/OpenAI AI Credit CEO using the Responses API.
- 12-agent registry with risk ceilings, bounded tools, evidence requirements and authority classes.
- Risk-aware agent router and deterministic workflow planner.
- Prompt-injection security guard and PII minimization.
- Agent safety eval suite and model/tool budget controls.
- Multi-tenant production domain model, RBAC and persistence contract.
- Case/evidence model, consent/audit ledgers and approval gates.
- Strict internal model tools; no external executor is exposed to the model.
- Deterministic fallback when OpenAI is unavailable.
- Demo-safe production readiness gate.

## Run

```bash
cp .env.example .env.local
npm install
npm run check:core
npm run build
npm run dev
```

Set `OPENAI_API_KEY` only on the server. Never expose it via `NEXT_PUBLIC_*`.

## API

- `GET /api/brain` — deterministic Credit OS snapshot.
- `POST /api/chatgpt-brain` — ChatGPT AI Credit CEO run with tool orchestration.
- `GET /api/agents` — agent registry and authority summary.
- `POST /api/agent-router` — risk-aware agent routing + workflow plan.
- `POST /api/security-guard` — prompt-injection scan + PII minimization.
- `GET /api/evals` — agent safety evaluation suite.
- `GET /api/agentic-status` — control-plane health and budget policy.
- `GET /api/cases` — current cases and evidence.
- `GET /api/clients` — demo-safe client directory.
- `GET /api/ledger` — audit/agent-run ledger snapshot.
- `GET /api/platform-status` — multi-tenant/persistence status.
- `POST /api/policy` — independent policy decision.
- `GET /api/readiness` — fail-closed production readiness.

## Authority boundary

ChatGPT and specialist agents may reason, inspect internal state, prioritize, calculate, and propose. They cannot submit disputes, transfer money, open credit, create identity-theft allegations, fabricate evidence, or bypass consent. Sensitive actions remain governed by the independent local policy engine and explicit approval workflows.
