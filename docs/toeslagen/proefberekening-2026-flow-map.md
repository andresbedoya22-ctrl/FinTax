# Proefberekening Toeslagen 2026 Flow Map

Date: 2026-04-24
Branch: `feature/toeslagen-2026-official-engine`

## Canonical Flow

1. `start`
   - Select one or more benefits: `zorgtoeslag`, `huurtoeslag`, `kindgebondenBudget`, `kinderopvangtoeslag`
   - Validation: at least one benefit selected
2. `applicant`
   - Applicant birth date
   - Country of residence
   - Dutch-resident flag
   - BSN known flag
3. `partner`
   - Partner present
   - If yes:
   - Partner birth date
   - Partner country of residence
   - Same-address flag
   - Toeslagpartner flag
4. `income`
   - Applicant annual income
   - Applicant activity statuses
   - Partner annual income when applicable
   - Partner activity statuses when applicable
5. `health`
   - Applicant Dutch health insurance
   - Partner Dutch health insurance when applicable
   - CAK/treaty-insured flag
6. `children`
   - Repeating child records
   - Birth date
   - Lives with applicant
   - Co-parenting flag
   - Days per year with applicant
   - Kinderbijslag flag
   - BSN known flag
   - Has income
   - Annual income when applicable
   - Assets on 1 January when applicable
   - Goes to childcare
7. `childcare`
   - For each child marked as going to childcare:
   - Repeating childcare arrangements
   - Childcare kind
   - Provider type
   - LRK registered flag
   - LRK number
   - Monthly hours
   - Hourly rate
   - Contract flag
   - Own-contribution flag
8. `residents`
   - Repeating resident records
   - Birth date
   - Relationship
   - Same-address registration
   - Annual income
   - Assets on 1 January
   - Subtenant flag
   - Subrent-contract flag
9. `housing`
   - Basic monthly rent
   - Standplaats cost
   - Independent home
   - Rental contract
   - Room-rental flag
   - Group-housing flag
   - Recognized exception
   - Woonwagen flag
10. `assets`
   - Applicant assets on 1 January
   - Partner assets on 1 January when applicable
   - Special-assets flag
11. `specialSituations`
   - Foreign residence/work
   - Child abroad
   - Childcare abroad
   - CAK
   - Military
   - Detention
   - Gemoedsbezwaarde
   - No fixed address
   - Bijzondere vermogen
   - Bijzonder inkomen
   - Long absence from home
   - Home care
   - Composed family
   - Adoption/foster/stepchild
   - Manual review notes
12. `results`
   - Eligibility status per benefit
   - Monthly and annual estimate
   - Blocking reasons
   - Warning reasons
   - Calculation trace
   - Document checklist
   - Estimated / not definitive disclaimer

## Conditional Branches

- `partner` fields are active only when `hasPartner = true`
- `partner` household impact only applies when `partner.isToeslagPartner = true`
- `children[].annualIncome` is active only when `children[].hasIncome = true`
- `childcare` arrangements are active only when `children[].goesToChildcare = true`
- `residents[].isSubtenant + hasSubrentContract = true` excludes the resident from huur household income/assets aggregation
- `housing.recognizedException = true` can unblock otherwise ineligible room-rental or group-housing cases, but documents/manual review may still apply
- `specialSituations.*` flags can move otherwise calculable cases into manual review

## Validation Rules

- Year is fixed to `2026`
- At least one selected benefit is required
- Numeric money and hours fields are non-negative
- Child `daysPerYearWithApplicant` is constrained to `0..366`
- KOT arrangement hours and rates must be positive to avoid blocking reasons
- The engine normalizes child and resident asset aggregates into the shared `assets` snapshot before evaluation

## Manual Review Branches

- `zorgtoeslag`
  - Foreign residence/work
  - CAK/treaty-insured
  - Military, detention, gemoedsbezwaarde, no fixed address, bijzondere vermogen
- `huurtoeslag`
  - Bijzonder inkomen
  - Bijzondere vermogen
  - Long absence from home
  - Home care situation
  - Young-household path flagged for confirmation
- `kindgebonden budget`
  - Child abroad and missing woonlandfactor logic
  - Composed family
  - Co-parenting
  - Kinderbijslag exception for 16/17-year-olds
- `kinderopvangtoeslag`
  - Childcare abroad
  - Any scenario that would require an incomplete official percentage table
