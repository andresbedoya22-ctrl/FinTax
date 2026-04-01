# Conditional Rules

## Purpose

This document translates business requirements into deterministic backend rules for intake and checklist generation. These rules should be implemented on the server against normalized intake facts, not only in frontend visibility logic.

## Rule design principles

- A question may be conditionally visible on the frontend, but a backend rule must still validate whether the answer is required.
- Requirement generation uses normalized facts, not raw form control state.
- Rules should be tax-year aware when regulatory or document expectations vary.
- Country-of-origin support must remain generic for Europe and not single-country hardcoded.

## Core intake fact groups

### Filing baseline

Capture:

- `tax_year`
- `case_type`
- `first_declaration_with_fintax`
- `filing_route`
- `origin_country_code`
- `current_country_of_residence`

### Residency and registration

Capture:

- `registered_in_nl_full_year`
- `first_registration_date_in_nl`
- `reestablishment_date_in_nl`
- `had_registration_interruption`
- `registration_interruption_periods[]`
- `emigrated_or_deregistered`
- `emigration_or_deregistration_date`

### Household

Capture:

- `has_fiscal_partner`
- `has_children_registered_same_address`
- `children_count_same_address`

### Income

Capture:

- `employment_employers[]`
- `has_uwv_income`
- `has_transitievergoeding`
- `has_zzp_income`
- `zzp_hours_over_1225`
- `has_other_foreign_income`

### Housing / debts / assets

Capture:

- `owns_home`
- `has_mortgage`
- `has_svn_or_starterslening`
- `has_consumer_loans`
- `has_nl_bank_accounts`
- `has_foreign_bank_accounts`
- `has_crypto`

### Deductions

Capture:

- `has_unreimbursed_deductible_medical_costs`

## Conditional question rules

### Registration and residency questions

#### Rule R-REG-001

Ask `reestablishment_date_in_nl` only if any of the following is true:

- first declaration with FinTax, or
- first NL registration happened in the selected tax year, or
- there was a registration interruption.

#### Rule R-REG-002

Ask child data only if:

- there were children registered at the same address.

#### Rule R-REG-003

Ask `emigration_or_deregistration_date` only if:

- client emigrated, or
- client stopped being registered in NL during the fiscal year.

#### Rule R-REG-004

Mark `requires_origin_income_certificate = true` if:

- client was not registered in the Netherlands for the full fiscal year.

This must not be hardcoded to Spain. It applies generically to origin-country income evidence within Europe and can later expand beyond Europe.

## Requirement generation rules

Below, “generate requirement” means create a `case_requirements` row in `pending` status unless already satisfied by approved evidence.

### Identity and residency

#### Rule Q-ID-001

Generate `passport_or_id_document` for every tax return case.

#### Rule Q-REG-001

Generate `proof_of_nl_registration_periods` if:

- not registered full year in NL, or
- registration interruption exists, or
- emigration/deregistration exists.

Accepted evidence examples:

- BRP extract,
- municipality registration proof,
- deregistration confirmation.

#### Rule Q-REG-002

Generate `origin_country_income_certificate` if:

- `requires_origin_income_certificate = true`.

Help content must explain:

- what the certificate is,
- when it is needed,
- that it should cover the selected tax year,
- that the origin country is case-specific and not tied to a hardcoded country.

### Income

#### Rule Q-INC-001

Generate one `jaaropgaaf_employer` requirement per employer in `employment_employers[]`.

This must be cardinality-aware, not a single generic “income statement” item.

#### Rule Q-INC-002

Generate `uwv_statement` if:

- `has_uwv_income = true`.

#### Rule Q-INC-003

Generate `transitievergoeding_statement` if:

- `has_transitievergoeding = true`.

#### Rule Q-INC-004

Generate `zzp_profit_documents` if:

- `has_zzp_income = true`.

Expected evidence may include:

- annual profit overview,
- bookkeeping export,
- VAT summaries when relevant.

#### Rule Q-INC-005

Generate `zzp_1225_hours_support` if:

- `has_zzp_income = true`
- and user indicates `zzp_hours_over_1225 = true`.

This requirement is evidence of substantiation, not just a checkbox.

### Housing / debts / assets

#### Rule Q-HOU-001

Generate `mortgage_jaaroverzicht` if:

- `has_mortgage = true`.

#### Rule Q-HOU-002

Generate `svn_starterslening_jaaroverzicht` if:

- `has_svn_or_starterslening = true`.

#### Rule Q-DEBT-001

Generate `consumer_loan_statements` if:

- `has_consumer_loans = true`.

#### Rule Q-ASSET-001

Generate `nl_bank_and_savings_statements_summary` if:

- `has_nl_bank_accounts = true`.

#### Rule Q-ASSET-002

Generate `foreign_bank_and_savings_statements_summary` if:

- `has_foreign_bank_accounts = true`.

#### Rule Q-ASSET-003

Generate `crypto_value_proof_open_close_year` if:

- `has_crypto = true`.

Help content must explicitly ask for value on:

- `01/01/{tax_year}`
- `31/12/{tax_year}`

### Deductions

#### Rule Q-DED-001

Generate `medical_costs_proof_unreimbursed` if:

- `has_unreimbursed_deductible_medical_costs = true`.

## Rule interaction and precedence

### Checklist regeneration

Trigger checklist regeneration when:

- tax year changes,
- residency/registration answers change,
- origin country changes,
- child same-address flag changes,
- income applicability flags change,
- mortgage/SVN/loan/account/crypto flags change,
- medical deduction applicability changes.

### Preservation rule

When regenerating:

- keep existing requirement row if the same `requirement_code` and cardinality key still apply,
- keep linked approved documents if still valid,
- mark old no-longer-applicable requirements as `not_applicable` rather than deleting immediately.

### Cardinality rule

Requirements that may repeat must use a stable cardinality key:

- employer index or employer external identifier,
- account grouping,
- child grouping if introduced later.

## “How to obtain it” content rules

Every generated requirement that asks the client to fetch something externally must include:

- plain-language purpose,
- accepted file formats,
- tax year reference if applicable,
- source institution or origin hint,
- minimum content expected in the document,
- fallback instruction when the document is unavailable.

This help content must be production-ready content, not placeholders.

## Progress rules

### Client progress

Client progress should be calculated from `case_requirements`, not from wizard completion:

- `requirements_completed = approved + waived + not_applicable`
- `requirements_total = all blocking and non-blocking applicable requirements`
- `blocking_requirements_remaining = pending + rejected` where `is_blocking = true`

### Ready-for-review gate

Case can move to `in_review` when:

- there are no blocking requirements in `pending` or `rejected`,
- and upload finalization is complete.

### Back-to-client gate

Case should move or remain in `pending_documents` when:

- any blocking requirement is pending,
- or a previously reviewed requirement is rejected and needs action.

## Rule auditability

Each generated requirement must retain:

- rule set version,
- requirement template code,
- applicability reason,
- generation timestamp.

This is required so internal reviewers can explain why a document was requested.
