# Free-Tier Reality Check — New850 Credit Repair App

**Date:** 2026-09-17 (America/Chicago)
**Branch:** `build/workforce-advancement` (this doc ships on the branch; nothing here is merged)
**Scope:** Every paid/external dependency found in this repo, audited line-by-line: what it does, what breaks without its key, and how to keep running on $0.
**Standing rule (Juan):** zero capital. Nothing below may be purchased without Juan's explicit approval — see §7 "SPEND ITEMS".

> Notation: all file/line citations are against this branch. Every claim below traces to a cited line or a public vendor URL. No invented keys, prices, or credentials anywhere.

---

## 0. Verdict up front

The app is **operable on $0** with reduced automation. Every paid integration degrades **fail-closed and loudly** (typed errors, `deterministic-fallback` mode labels, readiness "setup" badges) — nothing silently corrupts. The core value loop (dispute-letter generation, compliance policy engine, billing eligibility, printable PDFs) works without any paid key. What money buys is **automation and convenience**, not capability:

| Dependency | Without the key | $0 workaround |
|---|---|---|
| OpenAI API | Deterministic fallback engages automatically (labelled `deterministic-fallback`) | None needed — fallback is built in |
| Lob certified mail | `MAIL_PROVIDER_NOT_CONFIGURED`; no automated mailing | Print signed PDF dispute letters (print route) and mail them manually (USPS certified) |
| Neon Postgres | Production throws `PRODUCTION_DATABASE_NOT_CONFIGURED`; dev uses in-memory demo store | Neon free-tier project (same `DATABASE_URL` shape, $0); billing store always needs a real DB |
| Stripe / Square | No hosted checkout; invoices stay `open` / `manual_review` | Zelle manual rail (env-only, zero fees) + staff reconciliation; invoices tracked in-app |
| Vercel Blob | Evidence upload/fetch throws `EVIDENCE_VAULT_NOT_CONFIGURED` | No local-file adapter exists in the repo yet — flagged as a future code task (§5); Vercel Blob free store is the $0 path today |

Readiness surface for all of the above: `lib/readiness.ts` → `getReadinessChecks()` — each missing piece renders as status `"setup"` (not `"ready"`), with a plain-language detail string (e.g. `"DATABASE_URL missing"`, `"Configure at least one hosted processor with signed webhook settlement before collecting production revenue"`).

---

## 1. OpenAI API — `lib/openai-brain.ts`

**What it does.** `runChatGPTBrain()` (function starts ~line 215) POSTs to `https://api.openai.com/v1/responses` (line 180) with `Authorization: Bearer <OPENAI_API_KEY>`, sending system instructions (lines 45–56), a PII-minimized snapshot, internal read-only tools (up to 4 tool rounds, lines 237–268), and requesting a strict JSON-schema response (`credit_brain_decision`, lines 65–96). Token usage is recorded on the trace (lines 252–258).

**What breaks without the key — verified.** Line 230: `if (!apiKey) return fallback(snapshot, "none", trace);` — the deterministic fallback engages **before any network call**. The fallback (lines 142–166):

- Builds recommendations from `snapshot.attention` (first 6 items, priorities preserved, `proposedAction` forced to `"analyze"`, confidence fixed at `0.7`).
- Runs the same `deterministicCouncil(snapshot)` as the AI path (line 158 — the multi-agent council is NOT AI-dependent; see `lib/agent-council.ts`).
- Returns `mode: "deterministic-fallback"`, a summary stating "Deterministic Credit OS orchestration is active; no external action was executed.", and a warning: `"Set OPENAI_API_KEY server-side to activate the ChatGPT brain."`
- Also fires on any API error: line 270 catch → `fallback(..., "AI brain call failed safely; deterministic fallback used.")`, and on empty model output (line 269).

**What is lost.** Natural-language summaries, model-synthesized recommendations beyond the attention queue, and multi-round tool reasoning. Nothing compliance-critical is lost: policy decisions are evaluated by the local `evaluateAction()` engine either way (lines 274–283), and the model is explicitly *not* the compliance authority (system instructions, line 49).

**$0 verdict:** The brain is fully operable on $0. The fallback is deterministic, auditable, and free.

---

## 2. Lob certified mail — `lib/bureau-mail.ts`

**What it does.** `sendCertifiedLetterViaLob()` (line ~88) POSTs a multipart form to `https://api.lob.com/v1/letters` (line 115) with Basic auth from `LOB_API_KEY` (line 118), `mail_type: usps_first_class`, `extra_service: certified` (LOB_EXTRA_SERVICE or default), double-sided, addressed to the bureau's hardcoded mailing address (`creditBureauMailingAddresses`, lines 11–36), with `Idempotency-Key` and `Lob-Version: 2024-01-01` headers. Returns letter id / tracking number.

**What breaks without the key — verified.** `bureauMailProviderConfigured()` (lines 44–52) requires `LOB_API_KEY` **plus** all five `NEW850_MAIL_FROM_*` vars (`NAME`, `ADDRESS_LINE1`, `CITY`, `STATE`, `ZIP`). If any are missing, `new850ReturnAddress()` returns `null` (line 55) and `sendCertifiedLetterViaLob()` throws `MAIL_PROVIDER_NOT_CONFIGURED` (line 94). The mail API route `app/api/documents/[id]/mail/route.ts` therefore cannot send — certified-mail automation is offline.

**$0 workaround.** Dispute letters are still **generated as PDFs** and served by the print route `app/api/documents/[id]/print/route.ts` (requires a signed current version, lines 37–43; streams the PDF, lines 59–63). On $0: download/print the PDF, take it to USPS, and mail it certified with return receipt yourself. The bureau addresses are already in the repo (lines 11–36) so the envelope needs no extra research. What you lose: one-click sending, programmatic tracking numbers, idempotent re-sends.

**$0 verdict:** Full workflow continuity with manual postage. No code changes required.

---

## 3. Neon Postgres — `@neondatabase/serverless`

**What it does.**
- `lib/neon-store.ts` line 1: `import { neon } from "@neondatabase/serverless"` — `NeonPlatformStore` (line 15) implements the whole `PlatformStore` contract (orgs, users, clients, consents, evidence, audit, agent runs) as raw SQL.
- `lib/billing-store.ts` line 1: same import; `databaseUrl()` (lines 45–49) throws `PRODUCTION_DATABASE_NOT_CONFIGURED` when `DATABASE_URL` is unset, and every billing function calls it.

**What breaks without `DATABASE_URL` — verified.** Two different behaviors:
- **Platform store** (`lib/platform-store.ts` lines 68–76, `getPlatformStore()`): if `DATABASE_URL` is unset and the environment is **not** production → returns the in-memory `MemoryPlatformStore` (line 32) seeded with demo data (`org_demo`, "Demo Consumer", lines 23–30). Data does **not** persist across restarts. If the environment **is** production (`VERCEL_ENV=production` or `APP_ENV=production`) → throws `PRODUCTION_DATABASE_NOT_CONFIGURED`. `storageMode()` (lines 78–81) reports `"demo-memory"` vs `"unavailable"` accordingly.
- **Billing store** (`lib/billing-store.ts`): **no** memory fallback. `listBillingInvoices`, `createBillingInvoice`, `settleStripeInvoice`, `settleSquareInvoice` all throw `PRODUCTION_DATABASE_NOT_CONFIGURED` without `DATABASE_URL`. Billing persistence strictly requires a real Postgres.

**$0 workaround.** Point `DATABASE_URL` at a **Neon free-tier project** — the `@neondatabase/serverless` driver needs a Neon HTTP endpoint (it is not a generic TCP driver; a plain local Postgres is *not* a drop-in without code changes). This costs $0 at small scale. There is no SQLite/local-file adapter in the repo; adding one would be a new code task, not a config change.

**$0 verdict:** Operable on $0 with a Neon free project. Do not run production billing against the in-memory store — it can't; it throws by design.

---

## 4. Stripe / Square / other payment providers — `lib/billing-store.ts`, `lib/payment-providers.ts`

**What they do.**
- `lib/stripe-payments.ts` line ~30: creates hosted Checkout Sessions via `https://api.stripe.com/v1/checkout/sessions` using `STRIPE_SECRET_KEY` (throws `STRIPE_SECRET_KEY_NOT_CONFIGURED` if missing, line 5); webhook signature verified against `STRIPE_WEBHOOK_SECRET`.
- `lib/square-payments.ts` line ~23: creates payment links via Square's Online Checkout API (`connect.squareup.com`, or sandbox per `SQUARE_ENVIRONMENT`) using `SQUARE_ACCESS_TOKEN` + `SQUARE_LOCATION_ID` (throws `<NAME>_NOT_CONFIGURED`, line 8).
- `lib/payment-providers.ts` `getPaymentProviders()` (lines 17–24) lists **six** providers and their exact required env vars:
  - `square`: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_WEBHOOK_SIGNATURE_KEY, SQUARE_WEBHOOK_NOTIFICATION_URL
  - `stripe`: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
  - `paypal`: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
  - `authorize_net`: AUTHORIZE_NET_API_LOGIN_ID, AUTHORIZE_NET_TRANSACTION_KEY, AUTHORIZE_NET_CLIENT_KEY
  - `adyen`: ADYEN_API_KEY, ADYEN_MERCHANT_ACCOUNT, NEXT_PUBLIC_ADYEN_CLIENT_KEY (marked "not required for launch")
  - `zelle`: ZELLE_RECIPIENT, ZELLE_DISPLAY_NAME — `mode: 'manual'`
- `lib/billing-store.ts` `attachCheckoutSession()` (line 141) only records sessions for `'stripe' | 'square'`; `settleStripeInvoice()` / `settleSquareInvoice()` (lines 155, 189) settle from signed webhooks only.

**What breaks without the keys — verified.** The readiness check `payment-settlement` (`lib/readiness.ts` line 38) shows `"setup"`: *"Configure at least one hosted processor with signed webhook settlement before collecting production revenue"*. `createStripeCheckoutSession` / `createSquareCheckout` throw their `*_NOT_CONFIGURED` errors. But `createBillingInvoice()` works with `DATABASE_URL` alone — invoices exist as provider-agnostic records (`provider` is optional, lines 33–34) in status `open`, and `lib/billing-policy.ts` (`evaluateBillingEligibility`, lines 21–70) enforces CROA/state gates (eligible / deferred / manual_review / blocked) **independently of any payment processor**.

**$0 workaround.** The `zelle` provider is `mode: 'manual'` by design: *"Customer-reported payments require staff reconciliation before an invoice is marked paid."* (`lib/payment-providers.ts` line 22). Set only `ZELLE_RECIPIENT` + `ZELLE_DISPLAY_NAME`, send the client the invoice details manually, and reconcile by hand. Processor fees: $0 (Zelle has no business-checkout fees through this path; the app collects nothing automatically).

**$0 verdict:** Billing records, eligibility gates, and invoices work on $0. Automated online card collection does not — it waits on Juan's approval of a processor.

---

## 5. Vercel Blob — `@vercel/blob`

**What it does.**
- `lib/evidence-vault.ts` line 2: `import { del, put } from "@vercel/blob"`. `uploadPrivateEvidence()` (line 32) writes private blobs under `credit-repair-masters/<org>/<client>/<ts>-<file>` (lines 37–42) with SHA-256 integrity hashing (line 35); `validateEvidenceFile()` (line 24) **throws `EVIDENCE_VAULT_NOT_CONFIGURED` when `BLOB_READ_WRITE_TOKEN` is unset** (line 20).
- Consumers: `app/api/documents/[id]/mail/route.ts` line 61 and `app/api/documents/[id]/print/route.ts` line 55 fetch via `get(vaultRef, { access: 'private' })` — both 404 without the vault.
- Readiness: `lib/readiness.ts` line 46 — `"vault": "setup"` without the token.

**What breaks without the key — verified.** No evidence files can be uploaded, retrieved for mailing, or printed from the vault. This is the **hardest $0 gap**: unlike the other four, there is **no built-in local-file adapter** in the repo today — Blob is the only storage backend wired in.

**$0 workaround (today).** Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN` — Vercel's Blob free tier is $0 at small scale; the code needs no changes. **Future code task (flagged, not implemented):** a local-filesystem `EvidenceVault` adapter behind the same interface for fully self-hosted $0 operation. That is a build task for a future cycle, not a config flip.

**$0 verdict:** Operable on $0 via Vercel Blob free tier. Local-disk storage requires new code.

---

## 6. Other external dependencies (for completeness)

| Dependency | Env vars | Behavior without it | $0 path |
|---|---|---|---|
| Contracted credit-data API | `CREDIT_DATA_PROVIDER`, `CREDIT_PROVIDER_API_KEY` | `lib/credit-data-providers.ts` documents the active operating model: **consumer-controlled free-report import** (AnnualCreditReport.com, bureau consumer portals — all free, listed lines 33+). Readiness `bureau` (`lib/readiness.ts` line 44) is explicitly `requiredForProduction: false` — *"deferred by business strategy until client volume and profitability justify contracted integration"*. | Already $0 by design |
| Lead-delivery email | `RESEND_API_KEY`, `LEADS_NOTIFICATION_EMAIL`, `LEADS_FROM_EMAIL` (or `LEADS_WEBHOOK_URL`) | `lib/readiness.ts` line 37 — `lead-delivery: "setup"`; paid acquisition blocked, organic/manual intake unaffected | `LEADS_WEBHOOK_URL` to a free endpoint, or leave unset |
| Neon Auth sessions | `NEON_AUTH_BASE_URL`/`VITE_NEON_AUTH_URL`, `NEON_AUTH_COOKIE_SECRET`/`AUTH_SECRET` | Readiness `auth-runtime: "setup"` (`lib/readiness.ts` line 40) — business-session gate cannot authenticate operators | Required for any multi-user production use; see §7 |

None of these are needed for a single-operator $0 run; all degrade to explicit `"setup"` states rather than failing silently.

---

## 7. SPEND ITEMS — require Juan's approval

Juan's rule: **nothing here is purchased without his explicit word.** The repo states no prices for any of these; each is listed as **"price per vendor — Juan approves before purchase."**

| # | Item | Env key(s) to provision | What it unlocks (verified above) | Cost |
|---|---|---|---|---|
| 1 | OpenAI API access | `OPENAI_API_KEY` (+ optional `OPENAI_MODEL`, default `gpt-5.6` per `lib/openai-brain.ts` line 218) | AI-drafted recommendations, natural-language summaries, tool-round reasoning in the Credit CEO brain | Price per vendor — Juan approves before purchase |
| 2 | Lob account | `LOB_API_KEY` + `NEW850_MAIL_FROM_NAME` / `ADDRESS_LINE1` / `ADDRESS_LINE2` / `CITY` / `STATE` / `ZIP` (+ optional `LOB_EXTRA_SERVICE`) | One-click certified mailing of dispute letters with tracking numbers | Price per vendor — Juan approves before purchase |
| 3 | Neon paid tier (beyond free) | `DATABASE_URL` (Neon connection string) | Persistent production database at scale; the free tier covers the $0 path | Price per vendor — Juan approves before purchase |
| 4 | Stripe account | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Hosted card checkout + signed webhook auto-settlement | Price per vendor — Juan approves before purchase |
| 5 | Square account | `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_NOTIFICATION_URL` (+ optional `SQUARE_ENVIRONMENT=sandbox`) | Square-hosted checkout + Cash App Pay + signed webhook settlement | Price per vendor — Juan approves before purchase |
| 6 | PayPal / Authorize.Net / Adyen | Per `lib/payment-providers.ts` lines 19–21 | Alternate processors; Adyen marked "not required for launch" | Price per vendor — Juan approves before purchase |
| 7 | Vercel Blob paid tier (beyond free) | `BLOB_READ_WRITE_TOKEN` | Evidence vault at scale; free tier covers the $0 path | Price per vendor — Juan approves before purchase |
| 8 | Contracted bureau data API | `CREDIT_DATA_PROVIDER`, `CREDIT_PROVIDER_API_KEY` | Unattended bureau pulls; explicitly **not** required — free consumer-import model is the production strategy (`lib/credit-data-providers.ts`, `lib/readiness.ts` line 44) | Price per vendor — Juan approves before purchase |
| 9 | Resend (lead email) | `RESEND_API_KEY`, `LEADS_NOTIFICATION_EMAIL`, `LEADS_FROM_EMAIL` | Automated lead notification emails | Price per vendor — Juan approves before purchase |

---

## 8. $0-run checklist

### Leave UNSET (do not provision)

```
OPENAI_API_KEY
LOB_API_KEY
NEW850_MAIL_FROM_NAME / NEW850_MAIL_FROM_ADDRESS_LINE1 / NEW850_MAIL_FROM_ADDRESS_LINE2 / NEW850_MAIL_FROM_CITY / NEW850_MAIL_FROM_STATE / NEW850_MAIL_FROM_ZIP
STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
SQUARE_ACCESS_TOKEN / SQUARE_LOCATION_ID / SQUARE_WEBHOOK_SIGNATURE_KEY / SQUARE_WEBHOOK_NOTIFICATION_URL
PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET
AUTHORIZE_NET_API_LOGIN_ID / AUTHORIZE_NET_TRANSACTION_KEY / AUTHORIZE_NET_CLIENT_KEY
ADYEN_API_KEY / ADYEN_MERCHANT_ACCOUNT / NEXT_PUBLIC_ADYEN_CLIENT_KEY
CREDIT_DATA_PROVIDER / CREDIT_PROVIDER_API_KEY
RESEND_API_KEY / LEADS_NOTIFICATION_EMAIL / LEADS_FROM_EMAIL
```

### Set for a $0 working run (all free tiers / env-only)

```
DATABASE_URL=<neon free-tier connection string>   # persistent Postgres; billing store requires it
BLOB_READ_WRITE_TOKEN=<vercel blob store token>   # evidence vault, free tier
ZELLE_RECIPIENT=<recipient>                        # manual payment rail, zero processor fees
ZELLE_DISPLAY_NAME=<display name>
```

### What still works on $0 (verified)

- **Credit CEO brain** in `deterministic-fallback` mode — recommendations, deterministic council, compliance policy decisions, full trace/audit (`lib/openai-brain.ts` lines 142–166).
- **Dispute-letter generation** as signed PDFs via the print route (`app/api/documents/[id]/print/route.ts`); manual USPS certified mailing using the bureau addresses in `lib/bureau-mail.ts` lines 11–36.
- **Compliance policy engine** — fully local, no key ever needed (`lib/compliance.ts`, `lib/state-compliance.ts`).
- **Billing**: invoice records + CROA/state eligibility gates (`lib/billing-store.ts`, `lib/billing-policy.ts`); collection via Zelle manual rail with staff reconciliation (`lib/payment-providers.ts` line 22).
- **Free consumer credit-report imports** as the data model (`lib/credit-data-providers.ts`; readiness marks the contracted bureau API non-required).
- **Readiness dashboard** accurately reports every gap as `"setup"` (`lib/readiness.ts`).

### What is degraded or offline on $0

- AI-drafted recommendations and natural-language summaries (fallback is template-driven).
- One-click certified mailing with tracking (manual USPS instead).
- Hosted online card checkout + automatic settlement (manual invoicing + Zelle instead).
- Evidence uploads without a Blob token (hardest gap — needs the free-tier token or a future local adapter).
- Dev-mode data does not persist without `DATABASE_URL` (in-memory demo store only).

---

*End of free-tier reality check. Companion doc (coordinator-owned): `docs/WORKFORCE-GAP-ANALYSIS.md` — not written here.*
