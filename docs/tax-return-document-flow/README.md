# Tax Return Document Flow Blueprint

This folder contains the production blueprint for replacing the manual email-based tax return document request process with a structured, full-stack workflow inside FinTax.

Documents:

- `current-state-audit.md`: repo-based audit of what exists today, what is reusable, and what is fake or incomplete.
- `target-architecture.md`: target service boundaries, lifecycle, and operational architecture.
- `data-model-plan.md`: proposed relational model, storage model, and migration plan.
- `conditional-rules.md`: executable business rules for intake, checklist generation, and document requests.
- `implementation-plan.md`: ordered implementation phases, API plan, frontend plan, and acceptance criteria.
- `risk-register.md`: security, integrity, privacy, and UX risks with mitigation strategy.

Scope of this phase:

- No large implementation of uploads/checklist engine yet.
- Establish an exact technical blueprint that can drive implementation without ambiguity.
