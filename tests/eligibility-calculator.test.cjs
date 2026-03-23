/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateEligibility } = require('../.tmp-test-build/lib/utils/eligibility-calculator.js');

test('eligible single resident gets zorg/huur estimate', () => {
  const result = calculateEligibility({
    age: 29,
    householdType: 'single',
    applicantAnnualIncome: 32000,
    partnerAnnualIncome: 0,
    applicantAssets: 12000,
    partnerAssets: 0,
    nlResident: true,
    hasHealthInsurance: true,
    hasIndependentHome: true,
    hasRentalContract: true,
    monthlyRent: 950,
    childrenUnder18: 0,
    receivesKinderbijslag: false,
    usesChildcare: false,
    childcareHoursPerMonth: 0,
    childcareType: 'daycare',
    childcareHourlyRate: 10,
    registeredChildcare: false,
    bothParentsWork: false,
  });

  assert.equal(result.zorgtoeslag.eligible, true);
  assert.equal(result.huurtoeslag.eligible, true);
  assert.equal(result.kindgebondenBudget.eligible, false);
  assert.ok(result.totalEstimatedAnnualAmount > 0);
});

test('high assets disqualify zorgtoeslag and kindgebonden budget', () => {
  const result = calculateEligibility({
    age: 35,
    householdType: 'single',
    applicantAnnualIncome: 28000,
    partnerAnnualIncome: 0,
    applicantAssets: 200000,
    partnerAssets: 0,
    nlResident: true,
    hasHealthInsurance: true,
    hasIndependentHome: true,
    hasRentalContract: true,
    monthlyRent: 800,
    childrenUnder18: 2,
    receivesKinderbijslag: true,
    usesChildcare: true,
    childcareHoursPerMonth: 20,
    childcareType: 'daycare',
    childcareHourlyRate: 10,
    registeredChildcare: true,
    bothParentsWork: true,
  });

  assert.equal(result.zorgtoeslag.eligible, false);
  assert.equal(result.kindgebondenBudget.eligible, false);
  assert.equal(result.kinderopvangtoeslag.eligible, true);
});

test('partner household uses combined income and assets', () => {
  const result = calculateEligibility({
    age: 38,
    householdType: 'partners',
    applicantAnnualIncome: 30000,
    partnerAnnualIncome: 38000,
    applicantAssets: 22000,
    partnerAssets: 170000,
    nlResident: true,
    hasHealthInsurance: true,
    hasIndependentHome: true,
    hasRentalContract: true,
    monthlyRent: 1100,
    childrenUnder18: 1,
    receivesKinderbijslag: true,
    usesChildcare: false,
    childcareHoursPerMonth: 0,
    childcareType: 'daycare',
    childcareHourlyRate: 0,
    registeredChildcare: false,
    bothParentsWork: false,
  });

  assert.equal(result.zorgtoeslag.eligible, false);
  assert.equal(result.huurtoeslag.eligible, false);
  assert.equal(result.kindgebondenBudget.eligible, false);
  assert.ok(result.zorgtoeslag.reasons.includes('income_too_high') || result.zorgtoeslag.reasons.includes('assets_too_high'));
});
