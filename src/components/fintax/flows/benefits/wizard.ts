import { z } from "zod";

import type { BenefitsWizardInput } from "@/lib/utils/eligibility-calculator";

export const benefitStepKeys = ["personal", "income", "assets", "housing", "health", "children", "results", "documentReview"] as const;

export type BenefitStepKey = (typeof benefitStepKeys)[number];
export type ChildcareType = "daycare" | "outOfSchoolCare" | "childminder";

type BenefitsValidationMessages = {
  enterNumber: (field: string) => string;
  minValue: (field: string, min: number) => string;
  maxValue: (field: string, max: number) => string;
  partnerAnnualIncomeRequired: string;
  partnerAssetsRequired: string;
};

const defaultValidationMessages: BenefitsValidationMessages = {
  enterNumber: (field) => `Enter a valid number for ${field}.`,
  minValue: (field, min) => `${field} must be at least ${min}.`,
  maxValue: (field, max) => `${field} must be at most ${max}.`,
  partnerAnnualIncomeRequired: "Partner annual income is required for partner households.",
  partnerAssetsRequired: "Partner assets are required for partner households.",
};

function requiredNumberField(field: string, messages: BenefitsValidationMessages, min = 0) {
  return z.number({ error: messages.enterNumber(field) }).min(min, { error: messages.minValue(field, min) });
}

function nullableNumberField(field: string, messages: BenefitsValidationMessages, min = 0) {
  return z.number({ error: messages.enterNumber(field) }).min(min, { error: messages.minValue(field, min) }).nullable();
}

export function createBenefitsWizardSchema(
  messages: BenefitsValidationMessages = defaultValidationMessages,
  labels: Partial<Record<"age" | "applicantAnnualIncome" | "partnerAnnualIncome" | "applicantAssets" | "partnerAssets" | "monthlyRent" | "childrenUnder18" | "childcareHoursPerMonth" | "childcareHourlyRate", string>> = {},
) {
  const resolvedLabels = {
    age: labels.age ?? "Age",
    applicantAnnualIncome: labels.applicantAnnualIncome ?? "Applicant annual income",
    partnerAnnualIncome: labels.partnerAnnualIncome ?? "Partner annual income",
    applicantAssets: labels.applicantAssets ?? "Applicant assets",
    partnerAssets: labels.partnerAssets ?? "Partner assets",
    monthlyRent: labels.monthlyRent ?? "Monthly rent",
    childrenUnder18: labels.childrenUnder18 ?? "Children under 18",
    childcareHoursPerMonth: labels.childcareHoursPerMonth ?? "Childcare hours per month",
    childcareHourlyRate: labels.childcareHourlyRate ?? "Hourly childcare rate",
  };

  return z
    .object({
      age: z
        .number({ error: messages.enterNumber(resolvedLabels.age) })
        .min(0, { error: messages.minValue(resolvedLabels.age, 0) })
        .max(120, { error: messages.maxValue(resolvedLabels.age, 120) }),
    householdType: z.enum(["single", "partners"]),
    applicantAnnualIncome: requiredNumberField(resolvedLabels.applicantAnnualIncome, messages),
    partnerAnnualIncome: nullableNumberField(resolvedLabels.partnerAnnualIncome, messages),
    applicantAssets: requiredNumberField(resolvedLabels.applicantAssets, messages),
    partnerAssets: nullableNumberField(resolvedLabels.partnerAssets, messages),
    nlResident: z.boolean(),
    hasHealthInsurance: z.boolean(),
    hasIndependentHome: z.boolean(),
    hasRentalContract: z.boolean(),
    monthlyRent: requiredNumberField(resolvedLabels.monthlyRent, messages),
    childrenUnder18: z
      .number({ error: messages.enterNumber(resolvedLabels.childrenUnder18) })
      .min(0, { error: messages.minValue(resolvedLabels.childrenUnder18, 0) })
      .max(12, { error: messages.maxValue(resolvedLabels.childrenUnder18, 12) }),
    receivesKinderbijslag: z.boolean(),
    usesChildcare: z.boolean(),
    childcareHoursPerMonth: requiredNumberField(resolvedLabels.childcareHoursPerMonth, messages),
    childcareType: z.enum(["daycare", "outOfSchoolCare", "childminder"]),
    childcareHourlyRate: requiredNumberField(resolvedLabels.childcareHourlyRate, messages),
    registeredChildcare: z.boolean(),
    bothParentsWork: z.boolean(),
  })
    .superRefine((values, ctx) => {
      if (values.householdType !== "partners") {
        return;
      }

      if (values.partnerAnnualIncome === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["partnerAnnualIncome"],
          message: messages.partnerAnnualIncomeRequired,
        });
      }

      if (values.partnerAssets === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["partnerAssets"],
          message: messages.partnerAssetsRequired,
        });
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

export function getStepFieldNames(step: number, values: BenefitsFormValues): Array<keyof BenefitsFormValues> {
  switch (benefitStepKeys[step]) {
    case "personal":
      return ["age", "householdType", "nlResident"];
    case "income":
      return [
        "applicantAnnualIncome",
        ...(values.householdType === "partners" ? (["partnerAnnualIncome"] as Array<keyof BenefitsFormValues>) : []),
      ];
    case "assets":
      return [
        "applicantAssets",
        ...(values.householdType === "partners" ? (["partnerAssets"] as Array<keyof BenefitsFormValues>) : []),
      ];
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

export function normalizeBenefitsValues(values: BenefitsFormValues): BenefitsFormValues {
  const nextValues = { ...values };

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

export function hydrateBenefitsValues(
  values: Partial<BenefitsFormValues> & {
    annualIncome?: number;
    assets?: number;
  },
): BenefitsFormValues {
  const nextValues: BenefitsFormValues = {
    ...benefitsDefaultValues,
    ...values,
    applicantAnnualIncome:
      values.applicantAnnualIncome ?? values.annualIncome ?? benefitsDefaultValues.applicantAnnualIncome,
    applicantAssets: values.applicantAssets ?? values.assets ?? benefitsDefaultValues.applicantAssets,
    partnerAnnualIncome: values.partnerAnnualIncome ?? benefitsDefaultValues.partnerAnnualIncome,
    partnerAssets: values.partnerAssets ?? benefitsDefaultValues.partnerAssets,
  };

  return normalizeBenefitsValues(nextValues);
}

export function mapBenefitsValuesToEligibilityInput(values: BenefitsFormValues): BenefitsWizardInput {
  const partnerAnnualIncome = values.householdType === "partners" ? (values.partnerAnnualIncome ?? 0) : 0;
  const partnerAssets = values.householdType === "partners" ? (values.partnerAssets ?? 0) : 0;

  return {
    age: values.age,
    householdType: values.householdType,
    applicantAnnualIncome: values.applicantAnnualIncome,
    partnerAnnualIncome,
    applicantAssets: values.applicantAssets,
    partnerAssets,
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

export function getEligibleBenefitKeys(results: Record<BenefitCardKey, { eligible: boolean }>): BenefitCardKey[] {
  return benefitCardOrder.filter((key) => results[key].eligible);
}
