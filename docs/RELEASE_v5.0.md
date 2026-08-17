# CREDIT REPAIR MASTERS v5.0 — Nationwide Compliance Automation

## Objective

Move the operating system from a Florida-only automated state overlay to a versioned nationwide compliance control plane.

## Core changes

- Replaces hard-coded Florida billing logic with jurisdiction rule bundles.
- Adds structured rules for advance-fee policy, written contracts, cancellation windows, performance limits, registration, bonding, communication authorization, and redaction.
- Adds official-source validated automation bundles for FL, CA, TX, NY, IL, and WA.
- Keeps all unverified state overlays fail-closed for automated billing and consequential external actions.
- Adds `/compliance` owner command center.
- Adds `/api/state-compliance` summary and state-specific rule endpoint.
- Preserves the federal CROA/FCRA baseline across all 50 states plus DC.
- Telemarketing transactions remain routed through the separate FTC TSR gate.

## Operating principle

Automation is allowed only when the applicable jurisdiction bundle is validated against authoritative sources. Intake, evidence storage, internal analysis, document generation, and internal workflow may run nationwide, while billing and consequential external actions remain blocked in unverified jurisdictions.

## Current autonomous jurisdiction set

FL, CA, TX, NY, IL, WA.

The remaining jurisdictions must be researched and promoted individually before the system can truthfully report nationwide autonomous status.
