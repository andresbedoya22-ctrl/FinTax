# Toeslagen 2026 Rules And Calculations

Date: 2026-04-24
Parameter set: `NL_TOESLAGEN_2026_V1`

Final entitlement is always determined by Dienst Toeslagen. This engine provides a structured estimate only.

## Zorgtoeslag

- Age threshold: `18+`
- Income caps:
  - Single: `40,857`
  - With partner: `51,142`
- Asset caps:
  - Single: `146,011`
  - With partner: `184,633`
- Formula:
  - Single `normpremie = 0.01912 x 29,736 + 0.1373 x max(0, income - 29,736)`
  - Partner `normpremie = 0.04289 x 29,736 + 0.1373 x max(0, jointIncome - 29,736)`
  - Single annual `= max(0, 2,119 - normpremie)`
  - Partner annual `= max(0, 4,238 - normpremie)`
  - Monthly `= floor(annual / 12)`
- Special case:
  - If a toeslagpartner exists but is not insured under the Dutch health-insurance rules, the pair amount is halved and a warning is emitted.

## Huurtoeslag

- Asset caps:
  - Single applicant: `38,479`
  - Applicant with partner: `76,958`
  - Per medebewoner: `38,479`
- Rent caps:
  - Young household path: `498.20`
  - Standard path: `932.93`
- Basishuur:
  - One person: `202.52`
  - Two or more persons: `200.71`
- Quality and capping thresholds:
  - Kwaliteitskortingsgrens: `498.20`
  - Aftoppingsgrens 1-2 persons: `713.02`
  - Aftoppingsgrens 3+ persons: `764.14`
- Income correction:
  - One person ijkpunt: `23,425`
  - Two or more ijkpunt: `31,500`
  - One person rate: `27%`
  - Two or more rate: `22%`
- Formula:
  - `rekenhuur = basicMonthlyRent + standplaatsCost when woonwagen`
  - Service costs ignored from 2026
  - `A = max(0, min(cappedRent, 498.20) - basishuur)`
  - `B = max(0, min(cappedRent, aftoppingsgrens) - 498.20) x 0.65`
  - `C = max(0, cappedRent - aftoppingsgrens) x 0.40`
  - `correction = max(0, rekeninkomen - ijkpunt) x rate / 12`
  - `monthly = floor(max(0, A + B + C - correction))`
- Child-income rule:
  - Resident children under 23 contribute only income above `6,218`
- Subtenant rule:
  - Valid subtenants are excluded from household income/assets calculations
- Young-household note:
  - The implementation follows the official brochure path where only part `A` applies to the young-household scenario and keeps a manual-review warning attached.

## Kindgebonden Budget

- Asset caps:
  - Single: `146,011`
  - With partner: `184,633`
- Thresholds:
  - Single: `29,736`
  - With partner: `39,141`
- Reduction:
  - `max(0, income - threshold) x 0.076`
- Base amounts:
  - Without partner:
    - 1 child: `5,996`
    - 2 children: `8,576`
    - 3+ children: `8,576 + (childrenCount - 2) x 2,580`
  - With partner:
    - 1 child: `2,580`
    - 2 children: `5,160`
    - 3+ children: `5,160 + (childrenCount - 2) x 2,580`
- Age additions:
  - Age `12-15`: `724`
  - Age `16-17`: `964`
- Formula:
  - `annual = max(0, base + ageAdditions - reduction)`
  - `monthly = floor(annual / 12)`
- Limitation:
  - Child-abroad cases are flagged for manual review and exact amounts are withheld because woonlandfactor logic is not encoded in this engine.

## Kinderopvangtoeslag

- Max hours:
  - `230` per child per month
  - `2,760` per year
- Max rates:
  - Dagopvang: `11.23`
  - Buitenschoolse opvang: `9.98`
  - Gastouderopvang: `8.49`
- First child:
  - Child with most eligible monthly hours
  - Tie-breaker: highest eligible monthly cost
- Cost formula per arrangement:
  - `eligibleRate = min(actualRate, officialMaxRate)`
  - `eligibleHours = min(arrangementHours, remainingChildHoursCap)`
  - `eligibleCost = eligibleRate x eligibleHours`
- Benefit formula:
  - First child `= eligibleCost x firstChildPercentage`
  - Next children `= eligibleCost x nextChildPercentage`
  - `monthly = floor(sum(childAmounts))`
- Official table:
  - Full 2026 percentage table imported from the public Rijksoverheid table
  - Example rows verified:
    - `0 - 24,149`: `96.0% / 96.0%`
    - `54,642 - 56,412`: `96.0% / 96.0%`
    - `56,413 - 58,184`: `95.5% / 95.6%`
    - `59,958 - 61,895`: `93.9% / 95.6%`

## Reason Codes

- Canonical reason-code list lives in [src/lib/toeslagen/reasons.ts](/C:/FinTax/src/lib/toeslagen/reasons.ts)
- Results expose:
  - `blockingReasons`
  - `warningReasons`
  - `manualReviewRequired`

## Rounding Rules

- Currency intermediate values keep cent precision where needed
- Result cards show decimal annual values where available
- Official monthly output paths use `floor(...)` where stated in the public formulas
