import { z } from "zod";

export const benefitStepKeys = ["personal", "income", "assets", "housing", "health", "children", "results"] as const;

export type BenefitStepKey = (typeof benefitStepKeys)[number];
export type ChildcareType = "daycare" | "outOfSchoolCare" | "childminder";

export const benefitsWizardSchema = z.object({
  age: z.number().min(0).max(120),
  householdType: z.enum(["single", "partners"]),
  annualIncome: z.number().min(0),
  assets: z.number().min(0),
  nlResident: z.boolean(),
  hasHealthInsurance: z.boolean(),
  hasIndependentHome: z.boolean(),
  hasRentalContract: z.boolean(),
  monthlyRent: z.number().min(0),
  childrenUnder18: z.number().min(0).max(12),
  receivesKinderbijslag: z.boolean(),
  usesChildcare: z.boolean(),
  childcareHoursPerMonth: z.number().min(0),
  childcareType: z.enum(["daycare", "outOfSchoolCare", "childminder"]),
  childcareHourlyRate: z.number().min(0),
  registeredChildcare: z.boolean(),
  bothParentsWork: z.boolean(),
});

export type BenefitsFormValues = z.infer<typeof benefitsWizardSchema>;

export const benefitsDefaultValues: BenefitsFormValues = {
  age: 30,
  householdType: "single",
  annualIncome: 32000,
  assets: 15000,
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
      return ["annualIncome"];
    case "assets":
      return ["assets"];
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

export function getEligibleBenefitKeys(results: Record<BenefitCardKey, { eligible: boolean }>): BenefitCardKey[] {
  return benefitCardOrder.filter((key) => results[key].eligible);
}
