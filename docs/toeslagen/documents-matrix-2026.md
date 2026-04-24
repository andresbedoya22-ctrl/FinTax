# Toeslagen 2026 Documents Matrix

Date: 2026-04-24

## Base Documents For All Benefits

- `identity_document`
- `bsn_applicant`
- `iban`
- `estimated_income_2026`
- `recent_payslip_or_income_proof`
- `authorization_or_machtiging_if_assisted`
- `partner_details_if_applicable` when partner exists

## Zorgtoeslag

- `health_insurance_policy_applicant`
- `health_insurance_policy_partner` when partner exists
- `income_proof`
- `assets_statement_if_near_limit`
- `cak_or_verdragsgerechtigde_proof` for CAK/foreign cases
- `special_status_evidence` for military, detention, gemoedsbezwaarde or no fixed address

## Huurtoeslag

- `rental_contract`
- `basic_rent_proof`
- `landlord_rent_change_letter`
- `brp_registration_proof`
- `rent_payment_proof`
- `partner_income_assets_proof` when partner exists
- `resident_income_assets_proof` when medebewoners exist
- `subtenant_contract_and_bank_statements` when underhuurders exist
- `woonwagen_standplaats_proof` for woonwagen scenarios
- `group_housing_recognition_proof` for recognized group-housing paths
- `co_parenting_agreement` when relevant
- `special_income_assets_manual_review_proof` for bijzonder inkomen/vermogen, long absence or home care

## Kindgebonden Budget

- `child_bsn`
- `child_birth_date`
- `svb_kinderbijslag_proof`
- `assets_1_january`
- `partner_income_proof` when partner exists
- `co_parenting_agreement` when relevant
- `composed_family_documents`
- `child_abroad_residence_and_woonlandfactor_documents`
- `foster_step_adoption_documents`
- `child_assets_proof`

## Kinderopvangtoeslag

- `childcare_contract`
- `lrk_number`
- `provider_name_address`
- `childcare_type`
- `start_end_date`
- `monthly_hours`
- `hourly_rate`
- `invoices`
- `bank_payment_proof`
- `child_bsn`
- `applicant_income_proof`
- `partner_income_activity_proof` when partner exists
- `employment_contract_or_payslip` for employees
- `zzp_kvk_invoices_bookkeeping_hours` for ZZP cases
- `education_enrollment_proof` for student cases
- `inburgering_course_proof`
- `uwv_or_municipality_trajectory_proof`
- `co_parenting_agreement`
- `foreign_childcare_registration`
- `gastouderbureau_contract_and_invoices`
- `change_letter_for_hours_or_rate`

## Scenario Notes

- Medebewoner documents appear only when non-subtenant residents exist
- Underhuurder documents appear only when `isSubtenant = true` and a subrent contract exists
- Manual-review documents are flagged with severity `manual_review`
- The canonical checklist logic lives in [src/lib/toeslagen/documents.ts](/C:/FinTax/src/lib/toeslagen/documents.ts)
