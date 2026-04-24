import type { BenefitEvaluationResult, ToeslagenEvaluation } from "../types";

export type EstimateRange = {
  minMonthly: number;
  maxMonthly: number;
  minAnnual: number;
  maxAnnual: number;
  confidence: "standard" | "manual_review" | "low";
};

function roundToNearestTen(value: number) {
  return Math.max(0, Math.round(value / 10) * 10);
}

function buildRangeFromAmount(amount: number, manualReviewRequired: boolean): EstimateRange {
  if (amount <= 0) {
    return {
      minMonthly: 0,
      maxMonthly: 0,
      minAnnual: 0,
      maxAnnual: 0,
      confidence: amount === 0 ? "low" : manualReviewRequired ? "manual_review" : "standard",
    };
  }

  const variance = manualReviewRequired ? 0.2 : 0.1;
  const minMonthly = roundToNearestTen(Math.max(0, amount * (1 - variance)));
  const maxMonthly = roundToNearestTen(Math.max(minMonthly, amount * (1 + variance)));

  return {
    minMonthly,
    maxMonthly,
    minAnnual: minMonthly * 12,
    maxAnnual: maxMonthly * 12,
    confidence: manualReviewRequired ? "manual_review" : "standard",
  };
}

export function buildBenefitEstimateRange(result: BenefitEvaluationResult): EstimateRange {
  return buildRangeFromAmount(result.estimatedMonthlyAmount ?? 0, result.manualReviewRequired);
}

export function buildPrePaymentEstimateRange(evaluation: ToeslagenEvaluation): EstimateRange {
  return buildRangeFromAmount(evaluation.totalEstimatedMonthlyAmount, evaluation.manualReviewRequired);
}
