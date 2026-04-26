## Tax return flow benchmark framing
### Current state
- This analysis is conceptual and repo-grounded. It compares the current FinTax implementation against common patterns from official Dutch filing flows, guided tax interview products and human-review tax intake products.
### Problems found
- FinTax currently behaves more like a compact intake + requirement workspace than a full professional filing interview.
### Risks
- P1 product expectation mismatch if the current flow is presented as complete aangifte handling.
### Required changes
- Position the current implementation honestly and rebuild the flow in dedicated phases.
### Priority
- P1
### Suggested PR
- PR C

## Filing scope and year selection
### Current state
- Case draft supports tax year and case type through generic draft creation.
### Problems found
- The route surface does not expose a dedicated tax-return draft contract.
- Filing route detail is still thinner than a professional intake.
### Risks
- P1 incorrect case routing.
### Required changes
- Make filing scope first-class: tax year, P/M/C/ZZP, prior filing context and service package.
### Priority
- P1
### Suggested PR
- PR C

## Identity
### Current state
- Full name and BSN are captured early; BSN is encrypted server-side in `/api/cases/draft`.
### Problems found
- Missing explicit capture of birth date, address, phone, bank account and identity-document readiness as structured intake fields.
### Risks
- P1 incomplete downstream dossier.
### Required changes
- Add a dedicated identity block with core personal and contact details.
### Priority
- P1
### Suggested PR
- PR C

## Residency and migration
### Current state
- Current intake covers full-year registration, first registration, interruption and emigration basics.
### Problems found
- Missing stronger support for migration-year nuance, BRP history, current residence detail and 30% ruling relevance.
### Risks
- P1 wrong route/requirements for M-form and non-resident cases.
### Required changes
- Expand migration/residency modeling and document rules.
### Priority
- P1
### Suggested PR
- PR C

## Partner and family
### Current state
- Current intake captures fiscal partner and children-at-address basics.
### Problems found
- Missing richer partner/family data, co-parenting evidence and child-specific operational detail.
### Risks
- P1 incomplete deductions/credits/benefits coordination.
### Required changes
- Add structured partner, child and co-parenting sections.
### Priority
- P1
### Suggested PR
- PR C

## Income Box 1
### Current state
- Current intake supports employers, UWV, ZZP and foreign income flags.
### Problems found
- Missing depth for multiple employers, pension, alimony, foreign income detail, payslip fallback logic and income document completeness checks.
### Risks
- P1 intake insufficient for real filing prep.
### Required changes
- Expand Box 1 interview and link each branch to document rules.
### Priority
- P1
### Suggested PR
- PR C

## Housing
### Current state
- Current intake only lightly covers owned home and mortgage-related flags.
### Problems found
- Missing rent vs buy clarity, WOZ, mortgage annual statement, purchase/sale events, erfpacht and housing document branches.
### Risks
- P1 incomplete housing deductions/data.
### Required changes
- Rebuild housing as a dedicated structured section.
### Priority
- P1
### Suggested PR
- PR C

## Box 3 assets and debts
### Current state
- Current intake only asks for NL accounts, foreign accounts, crypto and consumer loans at a high level.
### Problems found
- Missing valuations, dates, investment detail, second home detail and debt statements.
### Risks
- P1 materially incomplete Box 3 intake.
### Required changes
- Add 01/01 valuation-driven asset/debt capture and evidence requirements.
### Priority
- P1
### Suggested PR
- PR C

## Deductions
### Current state
- Current intake only contains a medical-costs flag.
### Problems found
- Missing donations, alimony, education/legacy scenarios, transport and other deduction branches.
### Risks
- P1 under-collected deduction opportunities and compliance risk.
### Required changes
- Add a full deductions section with dynamic relevance logic.
### Priority
- P1
### Suggested PR
- PR C

## Review and risk flags
### Current state
- Current review step exists, and requirement regeneration happens before document workspace.
### Problems found
- Review is not yet a true “missing info / risk flag / filing readiness” checkpoint.
### Risks
- P1 cases move forward without a strong completeness summary.
### Required changes
- Add review summary, unresolved flags, warnings and filing-readiness status.
### Priority
- P1
### Suggested PR
- PR C

## Payment and package selection
### Current state
- Product has Stripe checkout for cases and benefits.
### Problems found
- Tax return service packaging is not deeply expressed inside the tax-return flow itself.
### Risks
- P2 unclear commercial transition.
### Required changes
- Add explicit package/service step only when scope is operationally ready.
### Priority
- P2
### Suggested PR
- PR C or G

## Documents and checklist
### Current state
- Tax-return document requirement engine is the strongest backend area today.
### Problems found
- The requirement engine is ahead of the intake depth; some missing intake branches mean the checklist can only be as complete as the upstream answers.
### Risks
- P1 incomplete checklist generation for complex cases.
### Required changes
- Expand intake first, then extend requirement rules and templates.
### Priority
- P1
### Suggested PR
- PR C then PR D

## Machtiging / authorization
### Current state
- The repo supports machtiging status concepts in case data and UI copy.
### Problems found
- There is no end-to-end DigiD integration and no complete authorization-letter workflow in the current tax-return experience.
### Risks
- P1 if product copy overstates submission readiness.
### Required changes
- Keep DigiD out of promised functionality.
- Model authorization letter/code collection as a dedicated operational stage.
### Priority
- P1
### Suggested PR
- PR C or E

## Internal review and submission preparation
### Current state
- Admin APIs and case statuses exist.
### Problems found
- No complete internal review workspace or submission-preparation orchestration exists yet.
### Risks
- P1 operational bottleneck and unclear case readiness.
### Required changes
- Build internal review workspace, case triage and submission-preparation states.
### Priority
- P1
### Suggested PR
- PR E

## Minimum document map versus current repo
### Current state
- Current repo already covers parts of:
- employer documents
- migration/registration evidence
- children same-address evidence
- some banking/foreign-income branches
- requirement help content and checklist generation
### Problems found
- The repo does not yet cover the full requested minimum map end-to-end for:
- ID / residence permit collection
- IBAN / account confirmation
- pension statements
- detailed housing package
- second-home / full Box 3 package
- donations / alimony / broader deductions
- benefits-linked supporting evidence as one unified dossier
- authorization-letter/code workflow
### Risks
- P1 operational incompleteness
### Required changes
- Expand intake schema, requirement templates and admin review workflow in sequence.
### Priority
- P1
### Suggested PR
- PR C, D and E
