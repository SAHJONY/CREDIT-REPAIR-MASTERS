# Changelog

## 1.2.0 — Evidence Integrity & Dispute Intelligence
- Added deterministic dispute-claim eligibility for typed inaccuracy reasons.
- Accurate negative information is explicitly blocked from inaccuracy-based dispute drafting.
- Unsupported assertions and identity claims without verified identity evidence are blocked.
- Added evidence metadata SHA-256 fingerprints and per-case evidence matrices.
- Added `evaluate_dispute_claim` as an internal ChatGPT tool used by Credit CEO, Evidence, Dispute, Furnisher, Identity and Compliance agents.
- Expanded the safety eval suite with dispute-grounding and evidence-integrity tests.
- Added `/api/evidence-integrity` and `/api/dispute-intelligence` capability surfaces.
- Draft eligibility never implies submission eligibility; submission remains independently policy- and approval-gated.

## 1.1.0 — Autonomous Governance & Observability
- Added PII-minimized structured operation telemetry, request correlation, duration metrics and runtime instrumentation.
- Extended production operator authentication to every POST surface that can process client context.

## 1.0.0 — Owner Command Center
- Rebuilt the executive dashboard around the actual agentic, workflow, data-plane and security architecture.

## 0.9.0 — API Security Boundary
- Added fail-closed operator authentication for sensitive production APIs.

## 0.8.0 — Neon Data Plane
- Added tenant-scoped Neon/PostgreSQL persistence and schema-aware health.

## 0.7.0 — Durable Operations
- Added Vercel Workflow durable execution and approval hooks.

## 0.6.0 — Agentic Control Plane
- Added 12 specialized agents, risk routing, security/PII guard, budgets and safety evals.

## 0.5.0 — Production Foundation
- Added multi-tenant domain models, RBAC, persistence contract and SQL schema.

## 0.4.0 — Agentic Brain Control Plane
- Added bounded tool orchestration, memory, tracing and agent council.

## 0.3.0 — ChatGPT Brain
- Added OpenAI Responses API brain and structured recommendations.

## 0.2.0 — Case OS
- Added cases, evidence, consent, policy gateway and audit model.
