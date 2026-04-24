import { getDocumentChecklistForBenefit } from "../documents";
import { getManualReviewReasons } from "../engine/manual-review";
import { normalizeHousehold } from "../engine/normalize-household";
import { KINDEROPVANGTOESLAG_2026_TABLE, NL_TOESLAGEN_2026 } from "../parameters";
import type { BenefitEvaluationResult, CalculationStep, ChildSnapshot, HouseholdSnapshot } from "../types";

const VALID_ACTIVITY = new Set([
  "employed",
  "selfEmployed",
  "studentRecognized",
  "inburgeringCourse",
  "trajectoryToWork",
  "workReintegration",
]);

function floorEuro(value: number) {
  return Math.max(0, Math.floor(value));
}

function getChildMaxRate(childcareKind: ChildSnapshot["childcareArrangements"][number]["childcareKind"], providerType: ChildSnapshot["childcareArrangements"][number]["providerType"]) {
  const params = NL_TOESLAGEN_2026.kinderopvangtoeslag;
  if (providerType === "gastouder") {
    return params.maxRateGastouderopvang;
  }
  if (childcareKind === "buitenschoolseOpvang") {
    return params.maxRateBuitenschoolseOpvangKindercentrum;
  }
  return params.maxRateDagopvangKindercentrum;
}

function hasValidActivity(statuses: HouseholdSnapshot["applicant"]["activityStatus"]) {
  return statuses.some((status) => VALID_ACTIVITY.has(status));
}

function percentageBandForIncome(income: number) {
  return KINDEROPVANGTOESLAG_2026_TABLE.find(
    (band) => income >= band.minIncome && (band.maxIncome === null || income <= band.maxIncome),
  );
}

export function calculateKinderopvangtoeslag(snapshot: HouseholdSnapshot): BenefitEvaluationResult {
  const normalized = normalizeHousehold(snapshot);
  const params = NL_TOESLAGEN_2026.kinderopvangtoeslag;
  const blockingReasons: BenefitEvaluationResult["blockingReasons"] = [];
  const warningReasons: BenefitEvaluationResult["warningReasons"] = getManualReviewReasons(snapshot, "kinderopvangtoeslag");
  const steps: CalculationStep[] = [];

  if (!hasValidActivity(snapshot.applicant.activityStatus)) {
    blockingReasons.push("KOT_NO_VALID_ACTIVITY_APPLICANT");
  }
  if (normalized.hasPartner && snapshot.partner && !hasValidActivity(snapshot.partner.activityStatus)) {
    blockingReasons.push("KOT_NO_VALID_ACTIVITY_PARTNER");
  }

  const eligibleChildren = snapshot.children
    .filter((child) => child.goesToChildcare)
    .map((child) => {
      const eligibleHoursTotal = child.childcareArrangements.reduce((sum, arrangement) => {
        const cappedArrangementHours = Math.max(0, arrangement.monthlyHours);
        return sum + cappedArrangementHours;
      }, 0);

      const cappedHoursAcrossArrangements = Math.min(eligibleHoursTotal, params.maxHoursPerChildPerMonth);
      let remainingHours = cappedHoursAcrossArrangements;
      const arrangements = child.childcareArrangements.map((arrangement) => {
        const rateCap = getChildMaxRate(arrangement.childcareKind, arrangement.providerType);
        const arrangementHours = Math.min(Math.max(0, arrangement.monthlyHours), remainingHours);
        remainingHours = Math.max(0, remainingHours - arrangementHours);
        const eligibleRate = Math.min(arrangement.hourlyRate, rateCap);
        const cost = eligibleRate * arrangementHours;
        return { arrangement, eligibleHours: arrangementHours, eligibleRate, cost };
      });
      const totalCost = arrangements.reduce((sum, arrangement) => sum + arrangement.cost, 0);
      return { child, arrangements, eligibleHours: cappedHoursAcrossArrangements, totalCost };
    })
    .filter((entry) => entry.eligibleHours > 0);

  if (!eligibleChildren.length) {
    blockingReasons.push("KOT_NO_HOURS");
  }

  for (const entry of eligibleChildren) {
    if (!entry.child.livesWithApplicant && !entry.child.isCoParentingChild) {
      blockingReasons.push("KOT_CHILD_NOT_LIVING_WITH_APPLICANT");
    }
    if (!entry.child.bsnKnown) {
      blockingReasons.push("KOT_CHILD_BSN_REQUIRED");
    }
    for (const arrangement of entry.arrangements) {
      if (arrangement.arrangement.childcareKind === "tussenschoolseOpvang") {
        blockingReasons.push("KOT_TUSSENSCHOOLSE_OPVANG_NOT_ELIGIBLE");
      }
      if (!arrangement.arrangement.registeredLrk) {
        blockingReasons.push("KOT_NOT_REGISTERED_LRK");
      }
      if (!arrangement.arrangement.lrkNumber) {
        blockingReasons.push("KOT_NO_LRK_NUMBER");
      }
      if (arrangement.arrangement.hasContract === false) {
        blockingReasons.push("KOT_NO_CONTRACT");
      }
      if (arrangement.arrangement.parentsPayContribution === false) {
        blockingReasons.push("KOT_NO_EIGEN_BIJDRAGE");
      }
      if (arrangement.arrangement.monthlyHours <= 0) {
        blockingReasons.push("KOT_NO_HOURS");
      }
      if (arrangement.arrangement.hourlyRate <= 0) {
        blockingReasons.push("KOT_NO_RATE");
      }
    }
  }

  const band = percentageBandForIncome(normalized.jointIncome);
  if (!band) {
    blockingReasons.push("KOT_PERCENTAGE_TABLE_INCOMPLETE");
  }

  const orderedChildren = [...eligibleChildren].sort((left, right) => {
    if (right.eligibleHours !== left.eligibleHours) {
      return right.eligibleHours - left.eligibleHours;
    }
    return right.totalCost - left.totalCost;
  });

  const firstChildId = orderedChildren[0]?.child.id;
  const childCalculations = orderedChildren.map((entry) => {
    const rate = entry.child.id === firstChildId ? band?.firstChildRate ?? 0 : band?.nextChildRate ?? 0;
    const amount = entry.totalCost * rate;
    return {
      childId: entry.child.id,
      totalCost: entry.totalCost,
      rate,
      amount,
      eligibleHours: entry.eligibleHours,
    };
  });

  const monthly = floorEuro(childCalculations.reduce((sum, entry) => sum + entry.amount, 0));
  const annual = monthly * 12;

  steps.push(
    { code: "jointIncome", labelKey: "Benefits.results.calculation.income", value: normalized.jointIncome },
    { code: "firstChildId", labelKey: "Benefits.results.calculation.firstChild", value: firstChildId ?? null },
    { code: "firstChildRate", labelKey: "Benefits.results.calculation.firstChildRate", value: band?.firstChildRate ?? null },
    { code: "nextChildRate", labelKey: "Benefits.results.calculation.nextChildRate", value: band?.nextChildRate ?? null },
    { code: "monthly", labelKey: "Benefits.results.calculation.monthlyAmount", value: monthly },
    { code: "annual", labelKey: "Benefits.results.calculation.annualAmount", value: annual },
  );

  const docs = getDocumentChecklistForBenefit(snapshot, "kinderopvangtoeslag");
  const eligible = blockingReasons.length === 0;

  return {
    benefit: "kinderopvangtoeslag",
    eligible,
    manualReviewRequired: warningReasons.length > 0,
    estimatedAnnualAmount: eligible ? annual : 0,
    estimatedMonthlyAmount: eligible ? monthly : 0,
    blockingReasons: [...new Set(blockingReasons)],
    warningReasons: [...new Set(warningReasons)],
    calculationSteps: steps,
    requiredDocuments: docs.requiredDocuments,
    optionalDocuments: docs.optionalDocuments,
  };
}
