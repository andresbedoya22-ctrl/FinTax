import { z } from "zod";

import type { BenefitsWizardInput } from "@/lib/utils/eligibility-calculator";

export const benefitStepKeys = ["personal", "income", "assets", "housing", "health", "children", "results", "documentReview"] as const;

export type BenefitStepKey = (typeof benefitStepKeys)[number];
export type ChildcareType = "daycare" | "outOfSchoolCare" | "childminder";

type ValidationMessages = {
  enterNumber: (field: string) => string;
  minValue: (field: string, min: number) => string;
  maxValue: (field: string, max: number) => string;
  partnerAnnualIncomeRequired: string;
  partnerAssetsRequired: string;
};

type ValidationLabels = {
  age: string;
  applicantAnnualIncome: string;
  partnerAnnualIncome: string;
  applicantAssets: string;
  partnerAssets: string;
  monthlyRent: string;
  childrenUnder18: string;
  childcareHoursPerMonth: string;
  childcareHourlyRate: string;
};

const defaultMessages: ValidationMessages = {
  enterNumber: (field) => `Enter a valid number for ${field}.`,
  minValue: (field, min) => `${field} must be at least ${min}.`,
  maxValue: (field, max) => `${field} must be at most ${max}.`,
  partnerAnnualIncomeRequired: "Partner annual income is required for partner households.",
  partnerAssetsRequired: "Partner assets are required for partner households.",
};

const defaultLabels: ValidationLabels = {
  age: "Age",
  applicantAnnualIncome: "Applicant annual income",
  partnerAnnualIncome: "Partner annual income",
  applicantAssets: "Applicant assets",
  partnerAssets: "Partner assets",
  monthlyRent: "Monthly rent",
  childrenUnder18: "Children under 18",
  childcareHoursPerMonth: "Childcare hours per month",
  childcareHourlyRate: "Childcare hourly rate",
};

function numberField(field: string, min: number, messages: ValidationMessages, max?: number) {
  let schema = z
    .number()
    .refine((value) => Number.isFinite(value), messages.enterNumber(field))
    .min(min, messages.minValue(field, min));

  if (typeof max === "number") {
    schema = schema.max(max, messages.maxValue(field, max));
  }

  return schema;
}

export function createBenefitsWizardSchema(
  messages: Partial<ValidationMessages> = {},
  labels: Partial<ValidationLabels> = {},
) {
  const resolvedMessages = { ...defaultMessages, ...messages };
  const resolvedLabels = { ...defaultLabels, ...labels };

  return z
    .object({
      age: numberField(resolvedLabels.age, 0, resolvedMessages, 120),
      householdType: z.enum(["single", "partners"]),
      applicantAnnualIncome: numberField(resolvedLabels.applicantAnnualIncome, 0, resolvedMessages),
      partnerAnnualIncome: z.number().nullable(),
      applicantAssets: numberField(resolvedLabels.applicantAssets, 0, resolvedMessages),
      partnerAssets: z.number().nullable(),
      nlResident: z.boolean(),
      hasHealthInsurance: z.boolean(),
      hasIndependentHome: z.boolean(),
      hasRentalContract: z.boolean(),
      monthlyRent: numberField(resolvedLabels.monthlyRent, 0, resolvedMessages),
      childrenUnder18: numberField(resolvedLabels.childrenUnder18, 0, resolvedMessages, 12),
      receivesKinderbijslag: z.boolean(),
      usesChildcare: z.boolean(),
      childcareHoursPerMonth: numberField(resolvedLabels.childcareHoursPerMonth, 0, resolvedMessages),
      childcareType: z.enum(["daycare", "outOfSchoolCare", "childminder"]),
      childcareHourlyRate: numberField(resolvedLabels.childcareHourlyRate, 0, resolvedMessages),
      registeredChildcare: z.boolean(),
      bothParentsWork: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (values.householdType === "partners") {
        if (values.partnerAnnualIncome === null || !Number.isFinite(values.partnerAnnualIncome)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: resolvedMessages.partnerAnnualIncomeRequired,
            path: ["partnerAnnualIncome"],
          });
        }

        if (values.partnerAssets === null || !Number.isFinite(values.partnerAssets)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: resolvedMessages.partnerAssetsRequired,
            path: ["partnerAssets"],
          });
        }
      }
    });
}

export const benefitsWizardSchema = createBenefitsWizardSchema();

export type BenefitsFormValues = z.infer<typeof benefitsWizardSchema>;

export const benefitsDefaultValues: BenefitsFormValues = {
  age: 30,
  householdType: "single",
  applicantAnnualIncome: 32000,
  partnerAnnualIncome: null,
  applicantAssets: 15000,
  partnerAssets: null,
  nlResident: true,
  hasHealthInsurance: true,
  hasIndependentHome: true,
  hasRentalContract: true,
  monthlyRent: 950,
  childrenUnder18: 0,
  receivesKinderbijslag: false,
  usesChildcare: false,
  childcareHoursPerMonth: 0,
  childcareType: "daycare",
  childcareHourlyRate: 10,
  registeredChildcare: false,
  bothParentsWork: false,
};

export type BenefitCardKey = "zorgtoeslag" | "huurtoeslag" | "kindgebondenBudget" | "kinderopvangtoeslag";

export const benefitCardOrder: BenefitCardKey[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebondenBudget",
  "kinderopvangtoeslag",
];

type LegacyBenefitsSnapshot = {
  annualIncome?: number;
  assets?: number;
};

export function hydrateBenefitsValues(
  values: (Partial<BenefitsFormValues> & LegacyBenefitsSnapshot) | null | undefined,
): BenefitsFormValues {
  return {
    ...benefitsDefaultValues,
    ...values,
    applicantAnnualIncome:
      values?.applicantAnnualIncome ?? values?.annualIncome ?? benefitsDefaultValues.applicantAnnualIncome,
    partnerAnnualIncome: values?.partnerAnnualIncome ?? null,
    applicantAssets: values?.applicantAssets ?? values?.assets ?? benefitsDefaultValues.applicantAssets,
    partnerAssets: values?.partnerAssets ?? null,
  };
}

export function normalizeBenefitsValues(values: BenefitsFormValues): BenefitsFormValues {
  const nextValues = hydrateBenefitsValues(values);

  if (nextValues.householdType !== "partners") {
    nextValues.partnerAnnualIncome = null;
    nextValues.partnerAssets = null;
  }

  if (!nextValues.hasIndependentHome) {
    nextValues.hasRentalContract = false;
    nextValues.monthlyRent = 0;
  } else if (!nextValues.hasRentalContract) {
    nextValues.monthlyRent = 0;
  }

  if (nextValues.childrenUnder18 === 0) {
    nextValues.receivesKinderbijslag = false;
    nextValues.usesChildcare = false;
    nextValues.childcareHoursPerMonth = 0;
    nextValues.childcareHourlyRate = 0;
    nextValues.registeredChildcare = false;
    nextValues.bothParentsWork = false;
  }

  if (!nextValues.usesChildcare) {
    nextValues.childcareHoursPerMonth = 0;
    nextValues.childcareHourlyRate = 0;
    nextValues.registeredChildcare = false;
    nextValues.bothParentsWork = false;
  }

  return nextValues;
}

export function mapBenefitsValuesToEligibilityInput(values: BenefitsFormValues): BenefitsWizardInput {
  return {
    age: values.age,
    householdType: values.householdType,
    applicantAnnualIncome: values.applicantAnnualIncome,
    partnerAnnualIncome: values.partnerAnnualIncome ?? 0,
    applicantAssets: values.applicantAssets,
    partnerAssets: values.partnerAssets ?? 0,
    nlResident: values.nlResident,
    hasHealthInsurance: values.hasHealthInsurance,
    hasIndependentHome: values.hasIndependentHome,
    hasRentalContract: values.hasRentalContract,
    monthlyRent: values.monthlyRent,
    childrenUnder18: values.childrenUnder18,
    receivesKinderbijslag: values.receivesKinderbijslag,
    usesChildcare: values.usesChildcare,
    childcareHoursPerMonth: values.childcareHoursPerMonth,
    childcareType: values.childcareType,
    childcareHourlyRate: values.childcareHourlyRate,
    registeredChildcare: values.registeredChildcare,
    bothParentsWork: values.bothParentsWork,
  };
}

export function getStepFieldNames(step: number, values: BenefitsFormValues): Array<keyof BenefitsFormValues> {
  switch (benefitStepKeys[step]) {
    case "personal":
      return ["age", "householdType", "nlResident"];
    case "income":
      return values.householdType === "partners"
        ? ["applicantAnnualIncome", "partnerAnnualIncome"]
        : ["applicantAnnualIncome"];
    case "assets":
      return values.householdType === "partners"
        ? ["applicantAssets", "partnerAssets"]
        : ["applicantAssets"];
    case "housing":
      return [
        "hasIndependentHome",
        ...(values.hasIndependentHome ? (["hasRentalContract"] as Array<keyof BenefitsFormValues>) : []),
        ...(values.hasIndependentHome && values.hasRentalContract ? (["monthlyRent"] as Array<keyof BenefitsFormValues>) : []),
      ];
    case "health":
      return values.nlResident ? ["hasHealthInsurance"] : [];
    case "children":
      return [
        "childrenUnder18",
        ...(values.childrenUnder18 > 0 ? (["receivesKinderbijslag", "usesChildcare"] as Array<keyof BenefitsFormValues>) : []),
        ...(values.childrenUnder18 > 0 && values.usesChildcare
          ? ([
              "childcareHoursPerMonth",
              "childcareType",
              "childcareHourlyRate",
              "registeredChildcare",
              "bothParentsWork",
            ] as Array<keyof BenefitsFormValues>)
          : []),
      ];
    default:
      return [];
  }
}

export function getEligibleBenefitKeys(results: Record<BenefitCardKey, { eligible: boolean }>): BenefitCardKey[] {
  return benefitCardOrder.filter((key) => results[key].eligible);
}
