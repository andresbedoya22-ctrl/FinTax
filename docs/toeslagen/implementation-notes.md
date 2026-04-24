# Toeslagen 2026 Implementation Notes

Date: 2026-04-24
Branch: `feature/toeslagen-2026-official-engine`

## Architecture

- Canonical domain moved to [src/lib/toeslagen](/C:/FinTax/src/lib/toeslagen)
- Structure:
  - `types.ts`
  - `reasons.ts`
  - `documents.ts`
  - `parameters/`
  - `calculators/`
  - `engine/`
- Legacy compatibility preserved in [src/lib/utils/eligibility-calculator.ts](/C:/FinTax/src/lib/utils/eligibility-calculator.ts)
- UI wizard canonical schema moved to [src/components/fintax/flows/benefits/wizard.ts](/C:/FinTax/src/components/fintax/flows/benefits/wizard.ts)

## Files Changed

- New domain engine and parameter files under `src/lib/toeslagen/`
- New tests under `tests/toeslagen/`
- Benefits flow rewritten in [src/components/fintax/flows/BenefitsFlow.tsx](/C:/FinTax/src/components/fintax/flows/BenefitsFlow.tsx)
- Results UI updated in:
  - [src/components/fintax/flows/benefits/BenefitsResults.tsx](/C:/FinTax/src/components/fintax/flows/benefits/BenefitsResults.tsx)
  - [src/components/fintax/flows/benefits/BenefitsEligibilityCard.tsx](/C:/FinTax/src/components/fintax/flows/benefits/BenefitsEligibilityCard.tsx)

## Test Strategy

- Pure calculator tests by benefit
- Manual-review tests
- Document-matrix tests
- Legacy-wrapper tests
- Existing repo gates kept in place through `pnpm qa`

## Limitations

- Child-abroad KGB scenarios are flagged for manual review and exact amounts are intentionally withheld until woonlandfactor handling is implemented
- Special cases listed by Dienst Toeslagen for foreign residence, bijzondere vermogen, bijzonder inkomen, long absence and home-care scenarios are surfaced as manual-review paths rather than silently approximated
- The current wizard is intentionally minimal in presentation but uses the new canonical domain model and no longer treats the old simplified flat schema as source of truth

## Official Data Gaps

- No critical 2026 parameter gap remains in the implemented set for the encoded benefits
- KOT 2026 percentage table status: complete and imported from the public Rijksoverheid table on 2026-04-24

## Freemium Disclosure And Payment Gating

- Free diagnosis now shows:
  - benefit-level eligibility / not eligible / manual review
  - a rounded estimated monthly range
  - commercial next-step copy and legal disclaimer
- Free diagnosis does not show:
  - exact annual or monthly amounts
  - calculation trace
  - detailed document checklist
  - full self-service filing instructions
- Post-payment unlocks:
  - exact estimated annual and monthly amounts from the existing official 2026 engine
  - calculation trace
  - benefit-level reasons
  - document checklist and post-payment next steps
- Legal/commercial wording was tightened:
  - no guaranteed-outcome language
  - no promise of error-free filing
  - all estimate surfaces keep the statement that Dienst Toeslagen determines the final amount
- Funnel states implemented in code:
  - `free_diagnosis`
  - `checkout_required`
  - `payment_pending`
  - `paid_document_collection`
  - `documents_incomplete`
  - `ready_for_review`
  - `application_preparation`
  - `submitted`
  - `completed`
- Checkout integration:
  - benefits wizard creates or updates a benefits draft case before Stripe checkout
  - unauthenticated users are redirected to auth and local wizard state is preserved for resume
- Current limitation:
  - post-payment document collection is staged on top of the existing generic case/docflow endpoints, but benefits-specific upload orchestration still needs a dedicated follow-up to make the upload CTA fully operational end-to-end
