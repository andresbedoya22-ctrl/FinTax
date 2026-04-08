# Tax Return Document Flow Blueprint and Delivery Record

This folder started as the production blueprint for replacing the manual email-based tax return document request process with a structured, full-stack workflow inside FinTax.

The blueprint is no longer speculative only:

- PR #67 established the blueprint and target model,
- PR #68 implemented the backend document-flow foundation,
- PR #69 cut the main frontend onto the backend-driven flow,
- PR #70 hardened the document flow,
- PR #71 added internal operational readiness,
- PR #72 hardened security surfaces around payments, admin operations, and DSAR,
- PR #73 refactored the tax-return intake into the current step wizard.

Documents:

- `current-state-audit.md`: repo-based audit of what exists today, what is reusable, and what is fake or incomplete.
- `target-architecture.md`: target service boundaries, lifecycle, and operational architecture.
- `data-model-plan.md`: proposed relational model, storage model, and migration plan.
- `conditional-rules.md`: executable business rules for intake, checklist generation, and document requests.
- `implementation-plan.md`: ordered implementation phases, API plan, frontend plan, and acceptance criteria used to drive the shipped work.
- `risk-register.md`: security, integrity, privacy, and UX risks with mitigation strategy.
- `../operations/tax-return-docflow-internal-readiness.md`: operator-facing readiness, bootstrap, backfill, and scripted E2E validation.
- `../operations/final-cleanup-status.md`: final status snapshot after the post-hardening cleanup sweep.

What is still useful here:

- the design intent and decisions remain the canonical rationale,
- the implementation docs explain why current tables/endpoints exist,
- some roadmap items in these docs remain historical and should be read as plan history, not as current repo status.
