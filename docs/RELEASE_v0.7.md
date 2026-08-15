# CREDIT REPAIR MASTERS OS v0.7 — Durable Operations

Release purpose: make approval-gated credit workflows durable, resumable, and auditable while preserving a hard boundary against autonomous external execution.

## Runtime additions

- Official Vercel Workflow runtime package.
- Durable `creditCaseWorkflow` with retryable step functions.
- Type-safe approval hook keyed to case + intent.
- Start, resume, and status APIs for workflow runs.
- Security review and deterministic policy routing before any approval wait state.

## Authority boundary

An approval only transitions a workflow to `approved_for_manual_execution`. It does not expose bureau, bank, creditor, furnisher, account-opening, or identity-theft execution tools to the AI system.

## Release verification

Production build must detect Next.js and Workflow directives, compile TypeScript, generate the application routes, and retain `externalExecutionEnabled: false` in durable workflows.
