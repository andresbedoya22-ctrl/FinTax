"use client";

import { z } from "zod";
import type { Path } from "react-hook-form";

import type { CaseType } from "@/types/database";

export const taxReturnStepKeys = [
  "identity",
  "income",
  "housing",
  "assets",
  "deductions",
  "summary",
  "submission",
] as const;

export type TaxReturnStepKey = (typeof taxReturnStepKeys)[number];
export type TaxReturnServiceKey = Extract<CaseType, "tax_return_p" | "tax_return_m" | "tax_return_c" | "tax_return_w">;

export interface TaxReturnServiceDefinition {
  id: TaxReturnServiceKey;
  queryAliases: string[];
  priceFrom: number;
  translationKey: "formP" | "formM" | "formC" | "zzp";
}

export const taxReturnServices: TaxReturnServiceDefinition[] = [
  { id: "tax_return_p", queryAliases: ["form_p", "tax_return_p", "p"], priceFrom: 89, translationKey: "formP" },
  { id: "tax_return_m", queryAliases: ["form_m", "tax_return_m", "m"], priceFrom: 119, translationKey: "formM" },
  { id: "tax_return_c", queryAliases: ["form_c", "tax_return_c", "c"], priceFrom: 109, translationKey: "formC" },
  { id: "tax_return_w", queryAliases: ["zzp", "tax_return_w", "self_employed"], priceFrom: 149, translationKey: "zzp" },
];

export const taxReturnWizardSchema = z.object({
  service: z.enum(["tax_return_p", "tax_return_m", "tax_return_c", "tax_return_w"]),
  identity: z.object({
    fullName: z.string().min(2),
    bsn: z.string().min(4),
  }),
  filing: z.object({
    taxYear: z.number().int().min(2020).max(2035),
    residency: z.enum(["resident", "migration", "non_resident"]),
    filingStatus: z.enum(["single", "married", "fiscal_partner"]),
    hasFiscalPartner: z.boolean(),
    partnerName: z.string(),
  }),
  income: z.object({
    incomeProfile: z.enum(["employment", "self_employed", "mixed", "benefits", "other"]),
    employerName: z.string(),
    monthsWorkedInNl: z.number().min(0).max(12),
    employmentIncome: z.number().min(0),
    selfEmploymentIncome: z.number().min(0),
    otherIncome: z.number().min(0),
    wageTaxWithheld: z.number().min(0),
  }),
  housing: z.object({
    homeSituation: z.enum(["tenant", "owner", "hosted", "other"]),
    address: z.string().min(5),
    city: z.string().min(2),
    postalCode: z.string().min(4),
    monthlyHousingCost: z.number().min(0),
    householdSize: z.number().min(1).max(10),
  }),
  assets: z.object({
    hasBox3Exposure: z.boolean(),
    taxpayerAssets: z.number().min(0),
    partnerAssets: z.number().min(0),
    hasForeignAssets: z.boolean(),
    notes: z.string(),
  }),
  deductions: z.object({
    healthcareCosts: z.number().min(0),
    educationCosts: z.number().min(0),
    donationCosts: z.number().min(0),
    otherContext: z.string(),
  }),
  submission: z.object({
    wantsReviewCall: z.boolean(),
    preferredContact: z.enum(["portal", "email", "phone"]),
    readyToContinue: z.boolean(),
  }),
});

export type TaxReturnFormValues = z.infer<typeof taxReturnWizardSchema>;

export interface TaxReturnEstimate {
  status: "range" | "pending";
  min: number | null;
  max: number | null;
  confidence: "low" | "medium";
  incomeTotal: number;
  deductionsTotal: number;
  missingDataKeys: TaxReturnMissingItemKey[];
}

export type TaxReturnMissingItemKey =
  | "annualStatement"
  | "withholding"
  | "partnerDetails"
  | "housingProof"
  | "assetStatements"
  | "deductionProof"
  | "bookkeeping";

export function createTaxReturnDefaultValues(service: TaxReturnServiceKey = "tax_return_p"): TaxReturnFormValues {
  return {
    service,
    identity: {
      fullName: "",
      bsn: "",
    },
    filing: {
      taxYear: 2025,
      residency: service === "tax_return_m" ? "migration" : service === "tax_return_c" ? "non_resident" : "resident",
      filingStatus: "single",
      hasFiscalPartner: false,
      partnerName: "",
    },
    income: {
      incomeProfile: service === "tax_return_w" ? "self_employed" : "employment",
      employerName: "",
      monthsWorkedInNl: service === "tax_return_c" ? 0 : 12,
      employmentIncome: 0,
      selfEmploymentIncome: 0,
      otherIncome: 0,
      wageTaxWithheld: 0,
    },
    housing: {
      homeSituation: "tenant",
      address: "",
      city: "",
      postalCode: "",
      monthlyHousingCost: 0,
      householdSize: 1,
    },
    assets: {
      hasBox3Exposure: false,
      taxpayerAssets: 0,
      partnerAssets: 0,
      hasForeignAssets: false,
      notes: "",
    },
    deductions: {
      healthcareCosts: 0,
      educationCosts: 0,
      donationCosts: 0,
      otherContext: "",
    },
    submission: {
      wantsReviewCall: false,
      preferredContact: "portal",
      readyToContinue: true,
    },
  };
}

export function resolveTaxReturnService(value: string | null | undefined): TaxReturnServiceKey {
  const normalized = value?.trim().toLowerCase();
  const match = taxReturnServices.find((service) => service.queryAliases.includes(normalized ?? ""));
  return match?.id ?? "tax_return_p";
}

export function normalizeTaxReturnValues(values: TaxReturnFormValues): TaxReturnFormValues {
  const nextValues = structuredClone(values) as TaxReturnFormValues;

  nextValues.service = resolveTaxReturnService(nextValues.service);
  nextValues.filing.hasFiscalPartner = nextValues.filing.filingStatus === "fiscal_partner" || nextValues.filing.filingStatus === "married";

  if (!nextValues.filing.hasFiscalPartner) {
    nextValues.filing.partnerName = "";
    nextValues.assets.partnerAssets = 0;
  }

  if (nextValues.income.incomeProfile !== "employment" && nextValues.income.incomeProfile !== "mixed") {
    nextValues.income.employerName = "";
    nextValues.income.monthsWorkedInNl = 0;
    nextValues.income.employmentIncome = 0;
    nextValues.income.wageTaxWithheld = 0;
  }

  if (nextValues.income.incomeProfile !== "self_employed" && nextValues.income.incomeProfile !== "mixed") {
    nextValues.income.selfEmploymentIncome = 0;
  }

  if (!nextValues.assets.hasBox3Exposure) {
    nextValues.assets.taxpayerAssets = 0;
    nextValues.assets.partnerAssets = 0;
    nextValues.assets.hasForeignAssets = false;
    nextValues.assets.notes = "";
  }

  return nextValues;
}

export function getTaxReturnStepFieldNames(step: number, values: TaxReturnFormValues): Array<Path<TaxReturnFormValues>> {
  switch (taxReturnStepKeys[step]) {
    case "identity":
      return [
        "identity.fullName",
        "identity.bsn",
        "filing.taxYear",
        "filing.residency",
        "filing.filingStatus",
        ...(values.filing.hasFiscalPartner ? ["filing.partnerName"] : []),
      ] as Array<Path<TaxReturnFormValues>>;
    case "income":
      return [
        "income.incomeProfile",
        ...(values.income.incomeProfile === "employment" || values.income.incomeProfile === "mixed"
          ? ["income.employerName", "income.monthsWorkedInNl", "income.employmentIncome", "income.wageTaxWithheld"]
          : []),
        ...(values.income.incomeProfile === "self_employed" || values.income.incomeProfile === "mixed"
          ? ["income.selfEmploymentIncome"]
          : []),
        "income.otherIncome",
      ] as Array<Path<TaxReturnFormValues>>;
    case "housing":
      return ["housing.homeSituation", "housing.address", "housing.city", "housing.postalCode", "housing.householdSize"] as Array<Path<TaxReturnFormValues>>;
    case "assets":
      return [
        "assets.hasBox3Exposure",
        ...(values.assets.hasBox3Exposure ? ["assets.taxpayerAssets", "assets.partnerAssets", "assets.hasForeignAssets"] : []),
      ] as Array<Path<TaxReturnFormValues>>;
    case "deductions":
      return ["deductions.healthcareCosts", "deductions.educationCosts", "deductions.donationCosts", "submission.preferredContact"] as Array<Path<TaxReturnFormValues>>;
    case "submission":
      return ["submission.preferredContact", "submission.readyToContinue"] as Array<Path<TaxReturnFormValues>>;
    default:
      return [];
  }
}

export function getTaxReturnEstimate(values: TaxReturnFormValues): TaxReturnEstimate {
  const normalized = normalizeTaxReturnValues(values);
  const incomeTotal =
    normalized.income.employmentIncome + normalized.income.selfEmploymentIncome + normalized.income.otherIncome;
  const deductionsTotal =
    normalized.deductions.healthcareCosts + normalized.deductions.educationCosts + normalized.deductions.donationCosts;
  const missingDataKeys = getTaxReturnMissingItemKeys(normalized);

  if (normalized.income.wageTaxWithheld <= 0 || incomeTotal <= 0) {
    return {
      status: "pending",
      min: null,
      max: null,
      confidence: "low",
      incomeTotal,
      deductionsTotal,
      missingDataKeys,
    };
  }

  const assetBase = normalized.assets.taxpayerAssets + normalized.assets.partnerAssets;
  const assetDrag = Math.max(0, assetBase - 57000) * 0.0025;
  const baseFloor = Math.max(0, normalized.income.wageTaxWithheld * 0.12 + deductionsTotal * 0.08 - assetDrag);
  const baseCeiling = Math.max(
    baseFloor,
    Math.min(
      normalized.income.wageTaxWithheld,
      normalized.income.wageTaxWithheld * 0.55 + deductionsTotal * 0.16 - assetDrag * 0.6,
    ),
  );

  return {
    status: "range",
    min: roundToNearest50(baseFloor),
    max: roundToNearest50(baseCeiling),
    confidence: missingDataKeys.length <= 2 ? "medium" : "low",
    incomeTotal,
    deductionsTotal,
    missingDataKeys,
  };
}

export function getTaxReturnMissingItemKeys(values: TaxReturnFormValues): TaxReturnMissingItemKey[] {
  const items = new Set<TaxReturnMissingItemKey>();

  if (values.income.employmentIncome > 0 && !values.income.employerName) items.add("annualStatement");
  if (values.income.employmentIncome > 0 && values.income.wageTaxWithheld <= 0) items.add("withholding");
  if (values.filing.hasFiscalPartner && !values.filing.partnerName) items.add("partnerDetails");
  if (values.housing.address && values.housing.homeSituation !== "hosted") items.add("housingProof");
  if (values.assets.hasBox3Exposure) items.add("assetStatements");
  if (values.deductions.healthcareCosts + values.deductions.educationCosts + values.deductions.donationCosts > 0) {
    items.add("deductionProof");
  }
  if (values.service === "tax_return_w") items.add("bookkeeping");

  return [...items];
}

function roundToNearest50(value: number) {
  return Math.round(Math.max(0, value) / 50) * 50;
}
