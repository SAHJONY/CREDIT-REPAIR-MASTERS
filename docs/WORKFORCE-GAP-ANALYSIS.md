# New850 Workforce Advancement — Gap Analysis

**Date:** 2026-09-17
**Branch:** `build/workforce-advancement` (from `cbb09c1`)
**Status:** advancement layer implemented and tested; **not merged, not deployed** — merge/deploy requires Juan's explicit approval.

> Honest framing: this document compares verifiable facts. Competitor claims cite public pages fetched 2026-09-17. Where a public page does not document a capability, this is stated as "not documented on the cited public page" — not as proof of absence.

---

## 1. What New850 already had (verified in repo, 2026-09-17)

- **12-agent registry** (`lib/agent-registry.ts`) with authority classes (`autonomous` / `approval_required` / `blocked`), risk ceilings, tool allowlists, per-agent tool-call budgets, evidence requirements.
- **AI Credit CEO** whose mission already includes next-best-action ranking; **independent Compliance Guardian**; evidence-grounded dispute intelligence (`lib/dispute-intelligence.ts`); policy engine (`lib/compliance.ts` → `evaluateAction`).
- **Deterministic OpenAI fallback** (`lib/openai-brain.ts`): without `OPENAI_API_KEY`, the brain returns labelled deterministic recommendations before any network call.
- **Compliance posture:** refuse to dispute accurate negatives; every factual dispute links to evidence; no promised score gains; CROA + FCRA + Texas Finance Code Ch. 393 reference (`lib/state-compliance.ts`).
- **Ops plumbing:** Lob certified bureau mail (`lib/bureau-mail.ts`), e-sign workflow, client portal, Financial Passport, New850 Readiness Score, multi-tenant RBAC, audit ledgers, SHA-256 evidence fingerprints, consent ledger.
- **No real i18n:** `package.json` has no next-intl/react-i18next/lingui. The only prior approach is a client-side DOM text-swap hack in `components/global-language-switcher.tsx` (partial hardcoded ES map).
- **No WhatsApp layer:** Sofia routing (`config/sofia-business-routing.json`) had no credit-repair business entry.
- **No 24/7 ops cycles:** no investigation-window tracker, no round sequencer, no dormant-case logic, no monitoring event feed.
- **No test suite:** no `test` script or test files existed.

## 2. What the advancement layer adds (this branch)

| Module | Files | What it does |
|---|---|---|
| Spanish-first i18n | `lib/i18n/` (dictionaries, t, banned, index) | ~130 ES/EN string keys, **ES default**, `{placeholder}` interpolation; test-enforced ES⇄EN key parity |
| Spanish dispute templates | `lib/dispute-templates-es.ts` | FCRA §611 R1/R2/R3 letters, pay-for-delete, goodwill — usted form, evidence-id bound, FCRA rights line, zero guarantee language |
| Spanish customer comms | `lib/customer-comms-es.ts` | WhatsApp-length templates (welcome, doc requests, round updates, window open/expired, case closed, education) + EN mirrors |
| Banned-language scanner | `lib/i18n/banned.ts` | `scanNoPromises()` — every template/comms string passes it in tests |
| Sofia WhatsApp concierge | `lib/sofia-credit/` (concierge, queue, guards) | 7 draft builders, **all `pending_approval`**, approval queue in `data/*.jsonl` (phone-masked logs), `markSent()` throws; policy-engine classification can never return plain-`allowed` |
| Sofia routing | `config/sofia-business-routing.json` | `credit_repair` entry, `isolation: 'business'` — New850 data stays separate from other businesses |
| 24/7 ops cycles | `lib/ops-cycles/` | 30-day FCRA windows (+45d for free annual reports), overdue flagging, >7d CFPB-escalation **drafts**, R1→R2→R3 sequencer with preconditions, 14-day dormant nudges (drafts), immutable monitoring event feed, `runDailySweep` orchestrator — **zero external sends anywhere** |
| Free-tier reality check | `ops/FREE-TIER-REALITY-CHECK.md` | per-dependency audit: what breaks without each key, $0 workaround, "SPEND ITEMS — Juan approves" list |
| Test infrastructure | `package.json` (`npm test`), `tsconfig.advancement.json` | `node --test` + `node:assert` on Node 24 native TS — zero new dependencies |

**Deliberately not built yet (next work):** portal UI wiring (Spanish-first pages, client-visible audit trail UI, approval-queue UI, ops feed UI) — the layer is logic + templates + queue files; UI integration is the follow-up. Also: Vercel Blob has no local-file adapter in the repo (flagged in the free-tier doc as a build task, not a config flip).

## 3. Competitive comparison matrix

All competitor facts from public pages, observed 2026-09-17.

| Capability | Credit Repair Cloud | DisputeBee | ScoreCEO | Client Dispute Manager | **New850 + advancement** |
|---|---|---|---|---|---|
| Starting price (public) | $179/mo Start → $599/mo Enterprise ([pricing](https://www.creditrepaircloud.com/pricing)) | $49/mo individual, $129/mo business ([site](https://disputebee.com/)) | $129–$299/mo, Advanced $299 ([pricing](https://scoreceo.com/plans-pricing-of-scoreceo-credit-repair-software/)) | $97–$199/mo ([comparison](https://scorepivot.com/blog/crc-vs-cdm-disputebee-scoreceo-2026)) | Pricing model undecided — **no invented fees** |
| Spanish-first client experience | Not documented on cited public page | Not documented on cited public page | Not documented on cited public page | Not documented on cited public page | **Yes — ES default, ~130-key dictionary, Spanish templates & comms** |
| WhatsApp-native client journey | Not documented (email automations listed) | Not documented | Not documented (SMS via Textbetter/Sinch) | Not documented | **Yes — Sofia concierge, draft-only, approval queue** |
| AI agents w/ authority boundaries | AI letters, Dispute Wizard | Intelligent letter suggester | CRM automations, compliance engines | AI Metro 2 letter engine | **12-agent registry: authority classes, risk ceilings, tool budgets, independent compliance guardian** |
| Evidence-grounded disputes | Letter library | Pre-written templates | Letters + compliance engines | AI-generated letters | **Every factual dispute links to evidence (repo + new templates)** |
| 30-day window tracking | Tasks/events listed | Process tracker | Workflows | Not documented on cited page | **Yes — 30/45d windows, overdue escalation drafts** |
| Dispute round sequencing | Not documented on cited page | Not documented on cited page | Customizable workflows | Not documented on cited page | **Yes — R1/R2/R3 state machine with preconditions** |
| State compliance engine | Not documented on cited page | Not documented on cited page | **Yes** (ScoreCEO advertises it) | Not documented on cited page | TX Ch. 393 reference + CROA/FCRA policy engine; full state engine = future work |
| Honest compliance posture | Industry enforcement context: CFPB's $2.7B 2023 judgment vs Lexington Law/CreditRepair.com ([review](https://stackeasy.ai/blog/credit-repair-cloud-review)) | — | — | — | **Refuse-to-dispute-accurate-negatives, no score promises, approval-gated externals** |

**Market support for the Spanish-first bet:** CFPB identifies language barriers as a consumer-finance risk and built plain-language Spanish resources + Spanish complaint intake ([CFPB](https://www.consumerfinance.gov/archive/blog/more-tools-for-spanish-speakers/)); 40M+ US Spanish speakers drive bilingual-staff demand ([The Credit Pros](https://www.thecreditpros.com/the-credit-pros-experience/is-the-credit-pros-hiring-bilingual-credit-repair-specialists/)).

**What we do NOT claim:** superiority over competitors is not asserted as a legal/compliance guarantee; ScoreCEO's state compliance engine is acknowledged as a real competitor strength; "not documented" ≠ "does not exist."

## 4. Test / build results (2026-09-17)

- `npm test` → `node --test lib/i18n/*.test.ts lib/sofia-credit/*.test.ts lib/ops-cycles/*.test.ts`
- **69/69 pass, 0 fail** (16 suites): i18n 17, sofia-credit 29, ops-cycles 23. Verified independently by coordinator re-run.
- Coverage includes: ES⇄EN key parity, switcher-map superset, ES defaulting, banned-language scans on all templates/comms, draft-only invariants (`markSent` throws, policy never plain-allowed), 30/45-day window math, 7-day escalation boundary, round preconditions, dormant detection, sweep fixture.
- **Not run (environmental):** `npx tsc` / `next build` / repo `lint`, `check:core`, `check:brand` — this VM's npm 10 cannot install dev dependencies (arborist crash `Cannot read properties of null (reading 'edgesOut')` on vitest/typescript graphs; simple packages install fine). Blocked by environment, not by the new code. Must be run where `npm install` succeeds before merge.

## 5. Run instructions

```bash
cd ~/workspace/repos/CREDIT-REPAIR-MASTERS
git checkout build/workforce-advancement
npm test   # node --test over the three new suites (Node 24+, zero deps)
# Per-module:
node --test lib/i18n/*.test.ts
node --test lib/sofia-credit/*.test.ts
node --test lib/ops-cycles/*.test.ts
```

Notes: new modules use explicit `.ts` import extensions (required by Node 24 type-stripping); erasable TS only (no enums/namespaces). Test artifacts for the approval queue are isolated via `SOFIA_CREDIT_DATA_DIR` — tests never write to the repo `data/` dir. When `npm install` works: `npx tsc -p tsconfig.advancement.json` for typechecking.

## 6. Free-vs-paid reality (from `ops/FREE-TIER-REALITY-CHECK.md`)

| Dependency | Without key | $0 workaround |
|---|---|---|
| OpenAI | deterministic fallback engages pre-network (verified `lib/openai-brain.ts:230`) | $0 — reduced AI depth, labelled |
| Lob | `MAIL_PROVIDER_NOT_CONFIGURED` | print signed PDFs, mail certified manually |
| Neon | dev falls back to in-memory demo store; billing store requires real DB | Neon free-tier project (signup, still $0) |
| Stripe/Square | checkout throws `*_NOT_CONFIGURED` | manual Zelle rail (env-only), staff reconciliation |
| Vercel Blob | uploads throw `EVIDENCE_VAULT_NOT_CONFIGURED` | **no local adapter yet — build task** |

Full $0-run checklist and the SPEND ITEMS list (prices marked "per vendor — Juan approves before purchase") are in the doc.

## 7. Standing owner action items (Juan must verify/complete before lawful operation)

1. **Texas Credit Services Organization registration** (Texas Finance Code Ch. 393) + the **$10,000 surety bond** — legal review before signing customer contracts or charging customers.
2. **Every paid API/service key** is a spend item requiring Juan's approval (list in `ops/FREE-TIER-REALITY-CHECK.md`).
3. **Fee model undecided** — none invented; CROA pay-after-service constraints stay enforced.
4. **Merge/deploy of this branch** — pending Juan's explicit approval; nothing here auto-sends, auto-mails, or auto-files.
5. **Portal UI wiring** for the new layer (Spanish-first pages, client audit-trail view, approval-queue UI, ops feed UI) — next build step.
6. **Full `npm install` + `tsc` + `next build` + repo checks** in an environment where npm works, before merge.
