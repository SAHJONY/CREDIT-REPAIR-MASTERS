# CREDIT REPAIR MASTERS OS

AI-agentic operating system for lawful consumer and business credit improvement workflows.

## v0.4 capabilities

- Credit Digital Twin and deterministic credit analytics.
- ChatGPT/OpenAI AI Credit CEO using the Responses API.
- Bounded multi-round function calling with strict internal tools.
- Tools are read-only/calculation/policy-only; no external executor is exposed to the model.
- Structured recommendations with an independent local compliance re-check.
- Case/evidence model and approval gates.
- Ephemeral, PII-minimized case memory with explicit clearing.
- Per-run trace events and token usage capture when available.
- Strategy/evidence/risk council cross-check.
- Deterministic fallback when OpenAI is unavailable.
- Demo-safe readiness gate.

## Run

```bash
cp .env.example .env.local
npm install
npm run check:core
npm run dev
```

Set `OPENAI_API_KEY` only on the server. Never expose it via `NEXT_PUBLIC_*`.

## API

- `GET /api/brain` — deterministic Credit OS snapshot.
- `GET /api/cases` — current cases and evidence.
- `POST /api/policy` — independent policy decision.
- `POST /api/chatgpt-brain` — ChatGPT AI Credit CEO run with tool orchestration.
- `GET /api/chatgpt-brain` — brain configuration and authority boundary.
- `GET /api/brain-trace` — trace capability description.
- `GET /api/readiness` — fail-closed production readiness.

## Authority boundary

ChatGPT may reason, inspect internal state, prioritize, and propose. It cannot submit disputes, transfer money, open credit, create identity-theft claims, or bypass evidence/consent controls. Sensitive actions remain governed by the local policy engine and explicit approval workflows.
