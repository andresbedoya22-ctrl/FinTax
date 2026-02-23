/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateEligibility } = require('../.tmp-test-build/lib/utils/eligibility-calculator.js');

test('eligible single resident gets zorg/huur estimate', () => {
  const result = calculateEligibility({
    age: 29,
    householdType: 'single',
    annualIncome: 32000,
    assets: 12000,
    nlResident: true,
    hasHealthInsurance: true,
    hasIndependentHome: true,
    hasRentalContract: true,
    monthlyRent: 950,
    childrenUnder18: 0,
    receivesKinderbijslag: false,
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
    annualIncome: 28000,
    assets: 200000,
    nlResident: true,
    hasHealthInsurance: true,
    hasIndependentHome: true,
    hasRentalContract: true,
    monthlyRent: 800,
    childrenUnder18: 2,
    receivesKinderbijslag: true,
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
