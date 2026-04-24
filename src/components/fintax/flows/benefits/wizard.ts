import { z } from "zod";

import type { BenefitKey, HouseholdSnapshot } from "@/lib/toeslagen";

export const benefitStepKeys = [
  "start",
  "applicant",
  "partner",
  "income",
  "health",
  "children",
  "childcare",
  "residents",
  "housing",
  "assets",
  "specialSituations",
  "results",
] as const;

export type BenefitStepKey = (typeof benefitStepKeys)[number];
export type BenefitCardKey = BenefitKey;

const activityStatusSchema = z.enum([
  "employed",
  "selfEmployed",
  "studentRecognized",
  "inburgeringCourse",
  "workReintegration",
  "trajectoryToWork",
  "unemployed",
  "none",
  "unknown",
]);

const childcareArrangementSchema = z.object({
  id: z.string(),
  childcareKind: z.enum(["dagopvang", "buitenschoolseOpvang", "tussenschoolseOpvang"]),
  providerType: z.enum(["kindercentrum", "gastouder"]),
  registeredLrk: z.boolean(),
  lrkNumber: z.string().optional(),
  monthlyHours: z.number().min(0),
  hourlyRate: z.number().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasContract: z.boolean(),
  parentsPayContribution: z.boolean(),
});

const childSchema = z.object({
  id: z.string(),
  birthDate: z.string(),
  livesWithApplicant: z.boolean(),
  isCoParentingChild: z.boolean(),
  daysPerYearWithApplicant: z.number().min(0).max(366),
  receivesKinderbijslag: z.boolean(),
  hasIncome: z.boolean(),
  annualIncome: z.number().min(0),
  assets1Jan: z.number().min(0),
  goesToChildcare: z.boolean(),
  bsnKnown: z.boolean(),
  childcareArrangements: z.array(childcareArrangementSchema),
});

const residentSchema = z.object({
  id: z.string(),
  birthDate: z.string(),
  relationship: z.string(),
  sameAddressRegistered: z.boolean(),
  annualIncome: z.number(),
  assets1Jan: z.number().min(0),
  isSubtenant: z.boolean(),
  hasSubrentContract: z.boolean(),
});

const personSchema = z.object({
  id: z.string(),
  birthDate: z.string(),
  countryOfResidence: z.string(),
  nlResident: z.boolean(),
  bsnKnown: z.boolean(),
  annualIncome: z.number(),
  assets1Jan: z.number().min(0),
  hasDutchHealthInsurance: z.boolean(),
  activityStatus: z.array(activityStatusSchema).min(1),
});

export const benefitsWizardSchema = z.object({
  year: z.literal(2026),
  selectedBenefits: z.array(z.enum(["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"])).min(1),
  applicant: personSchema,
  hasPartner: z.boolean(),
  partner: personSchema
    .extend({
      sameAddress: z.boolean(),
      isToeslagPartner: z.boolean(),
    })
    .nullable(),
  children: z.array(childSchema),
  residents: z.array(residentSchema),
  housing: z.object({
    rentsRoom: z.boolean(),
    independentHome: z.boolean(),
    groupHousingForElderlyOrAssistedLiving: z.boolean(),
    recognizedException: z.boolean(),
    hasRentalContract: z.boolean(),
    basicMonthlyRent: z.number().min(0),
    isWoonwagen: z.boolean(),
    monthlyStandplaatsCost: z.number().min(0),
    serviceCostsIncludedButIgnoredFrom2026: z.number().min(0),
  }),
  assets: z.object({
    applicantAssets1Jan: z.number().min(0),
    partnerAssets1Jan: z.number().min(0),
    childAssets1Jan: z.number().min(0),
    residentAssets1Jan: z.number().min(0),
    hasSpecialAssets: z.boolean(),
  }),
  specialSituations: z.object({
    foreignResidence: z.boolean(),
    foreignWork: z.boolean(),
    childAbroad: z.boolean(),
    childcareAbroad: z.boolean(),
    cakInsured: z.boolean(),
    military: z.boolean(),
    detained: z.boolean(),
    gemoedsbezwaarde: z.boolean(),
    noFixedAddress: z.boolean(),
    bijzondereVermogen: z.boolean(),
    bijzonderInkomen: z.boolean(),
    longAbsenceFromHome: z.boolean(),
    homeCareSituation: z.boolean(),
    composedFamily: z.boolean(),
    adoptionFosterStepChild: z.boolean(),
    manualReviewNotes: z.string(),
  }),
});

export type BenefitsFormValues = z.infer<typeof benefitsWizardSchema>;

export const benefitsDefaultValues: BenefitsFormValues = {
  year: 2026,
  selectedBenefits: ["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"],
  applicant: {
    id: "applicant",
    birthDate: "1995-06-01",
    countryOfResidence: "NL",
    nlResident: true,
    bsnKnown: true,
    annualIncome: 32000,
    assets1Jan: 15000,
    hasDutchHealthInsurance: true,
    activityStatus: ["employed"],
  },
  hasPartner: false,
  partner: null,
  children: [],
  residents: [],
  housing: {
    rentsRoom: false,
    independentHome: true,
    groupHousingForElderlyOrAssistedLiving: false,
    recognizedException: false,
    hasRentalContract: true,
    basicMonthlyRent: 950,
    isWoonwagen: false,
    monthlyStandplaatsCost: 0,
    serviceCostsIncludedButIgnoredFrom2026: 0,
  },
  assets: {
    applicantAssets1Jan: 15000,
    partnerAssets1Jan: 0,
    childAssets1Jan: 0,
    residentAssets1Jan: 0,
    hasSpecialAssets: false,
  },
  specialSituations: {
    foreignResidence: false,
    foreignWork: false,
    childAbroad: false,
    childcareAbroad: false,
    cakInsured: false,
    military: false,
    detained: false,
    gemoedsbezwaarde: false,
    noFixedAddress: false,
    bijzondereVermogen: false,
    bijzonderInkomen: false,
    longAbsenceFromHome: false,
    homeCareSituation: false,
    composedFamily: false,
    adoptionFosterStepChild: false,
    manualReviewNotes: "",
  },
};

export function createDefaultChild(index: number): BenefitsFormValues["children"][number] {
  return {
    id: `child-${index + 1}`,
    birthDate: "2020-01-01",
    livesWithApplicant: true,
    isCoParentingChild: false,
    daysPerYearWithApplicant: 365,
    receivesKinderbijslag: true,
    hasIncome: false,
    annualIncome: 0,
    assets1Jan: 0,
    goesToChildcare: false,
    bsnKnown: true,
    childcareArrangements: [],
  };
}

export function createDefaultChildcareArrangement(index: number): BenefitsFormValues["children"][number]["childcareArrangements"][number] {
  return {
    id: `arrangement-${index + 1}`,
    childcareKind: "dagopvang",
    providerType: "kindercentrum",
    registeredLrk: true,
    lrkNumber: "",
    monthlyHours: 0,
    hourlyRate: 0,
    startDate: "",
    endDate: "",
    hasContract: true,
    parentsPayContribution: true,
  };
}

export function createDefaultResident(index: number): BenefitsFormValues["residents"][number] {
  return {
    id: `resident-${index + 1}`,
    birthDate: "1990-01-01",
    relationship: "",
    sameAddressRegistered: true,
    annualIncome: 0,
    assets1Jan: 0,
    isSubtenant: false,
    hasSubrentContract: false,
  };
}

function isCanonicalBenefitsValues(value: unknown): value is BenefitsFormValues {
  return Boolean(
    value &&
      typeof value === "object" &&
      "applicant" in value &&
      "assets" in value &&
      "specialSituations" in value,
  );
}

function coerceLegacyValues(value: Record<string, unknown>): BenefitsFormValues {
  const age = typeof value.age === "number" ? value.age : 30;
  const hasPartner = value.householdType === "partners";
  const childrenUnder18 = typeof value.childrenUnder18 === "number" ? value.childrenUnder18 : 0;
  const usesChildcare = Boolean(value.usesChildcare);

  return {
    year: 2026,
    selectedBenefits: Array.isArray(value.selectedBenefits) && value.selectedBenefits.length
      ? (value.selectedBenefits as BenefitKey[])
      : ["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"],
    applicant: {
      id: "applicant",
      birthDate: `${2026 - age}-01-01`,
      countryOfResidence: value.nlResident ? "NL" : "UNKNOWN",
      nlResident: Boolean(value.nlResident),
      bsnKnown: true,
      annualIncome: typeof value.annualIncome === "number" ? value.annualIncome : 0,
      assets1Jan: typeof value.assets === "number" ? value.assets : 0,
      hasDutchHealthInsurance: Boolean(value.hasHealthInsurance),
      activityStatus: Boolean(value.bothParentsWork) ? ["employed"] : ["none"],
    },
    hasPartner,
    partner: hasPartner
      ? {
          id: "partner",
          birthDate: `${2025 - age}-01-01`,
          countryOfResidence: value.nlResident ? "NL" : "UNKNOWN",
          nlResident: Boolean(value.nlResident),
          bsnKnown: true,
          annualIncome: 0,
          assets1Jan: 0,
          hasDutchHealthInsurance: Boolean(value.hasHealthInsurance),
          activityStatus: Boolean(value.bothParentsWork) ? ["employed"] : ["none"],
          sameAddress: true,
          isToeslagPartner: true,
        }
      : null,
    children: Array.from({ length: childrenUnder18 }).map((_, index) => ({
      ...createDefaultChild(index),
      receivesKinderbijslag: Boolean(value.receivesKinderbijslag),
      goesToChildcare: usesChildcare,
      childcareArrangements: usesChildcare
        ? [
            {
              ...createDefaultChildcareArrangement(0),
              monthlyHours: typeof value.childcareHoursPerMonth === "number" ? value.childcareHoursPerMonth : 0,
              hourlyRate: typeof value.childcareHourlyRate === "number" ? value.childcareHourlyRate : 0,
              registeredLrk: Boolean(value.registeredChildcare),
              lrkNumber: Boolean(value.registeredChildcare) ? "123456789" : "",
              childcareKind:
                value.childcareType === "outOfSchoolCare"
                  ? "buitenschoolseOpvang"
                  : "dagopvang",
              providerType: value.childcareType === "childminder" ? "gastouder" : "kindercentrum",
            },
          ]
        : [],
    })),
    residents: [],
    housing: {
      rentsRoom: !Boolean(value.hasIndependentHome),
      independentHome: Boolean(value.hasIndependentHome),
      groupHousingForElderlyOrAssistedLiving: false,
      recognizedException: false,
      hasRentalContract: Boolean(value.hasRentalContract),
      basicMonthlyRent: typeof value.monthlyRent === "number" ? value.monthlyRent : 0,
      isWoonwagen: false,
      monthlyStandplaatsCost: 0,
      serviceCostsIncludedButIgnoredFrom2026: 0,
    },
    assets: {
      applicantAssets1Jan: typeof value.assets === "number" ? value.assets : 0,
      partnerAssets1Jan: 0,
      childAssets1Jan: 0,
      residentAssets1Jan: 0,
      hasSpecialAssets: false,
    },
    specialSituations: {
      ...benefitsDefaultValues.specialSituations,
      foreignResidence: !Boolean(value.nlResident),
    },
  };
}

export function getStepFieldNames(step: number): string[] {
  switch (benefitStepKeys[step]) {
    case "start":
      return ["selectedBenefits"];
    case "applicant":
      return ["applicant.birthDate", "applicant.countryOfResidence", "applicant.nlResident"];
    case "partner":
      return ["hasPartner", "partner"];
    case "income":
      return ["applicant.annualIncome", "applicant.activityStatus", "partner.annualIncome", "partner.activityStatus"];
    case "health":
      return ["applicant.hasDutchHealthInsurance", "partner.hasDutchHealthInsurance", "specialSituations.cakInsured"];
    case "children":
      return ["children"];
    case "childcare":
      return ["children"];
    case "residents":
      return ["residents"];
    case "housing":
      return ["housing"];
    case "assets":
      return ["assets"];
    case "specialSituations":
      return ["specialSituations"];
    default:
      return [];
  }
}

export function normalizeBenefitsValues(values: BenefitsFormValues): BenefitsFormValues {
  const sourceValues = isCanonicalBenefitsValues(values)
    ? values
    : coerceLegacyValues(values as unknown as Record<string, unknown>);
  const nextValues: BenefitsFormValues = structuredClone(sourceValues);
  nextValues.selectedBenefits = Array.from(new Set(nextValues.selectedBenefits));
  nextValues.applicant.assets1Jan = nextValues.assets.applicantAssets1Jan;

  if (!nextValues.hasPartner) {
    nextValues.partner = null;
    nextValues.assets.partnerAssets1Jan = 0;
  } else if (!nextValues.partner) {
    nextValues.partner = {
      id: "partner",
      birthDate: "1994-01-01",
      countryOfResidence: nextValues.applicant.countryOfResidence,
      nlResident: nextValues.applicant.nlResident,
      bsnKnown: true,
      annualIncome: 0,
      assets1Jan: nextValues.assets.partnerAssets1Jan,
      hasDutchHealthInsurance: true,
      activityStatus: ["none"],
      sameAddress: true,
      isToeslagPartner: true,
    };
  } else {
    nextValues.partner.assets1Jan = nextValues.assets.partnerAssets1Jan;
  }

  if (!nextValues.housing.independentHome) {
    nextValues.housing.hasRentalContract = false;
    nextValues.housing.basicMonthlyRent = 0;
  }

  nextValues.children = nextValues.children.map((child) => ({
    ...child,
    annualIncome: child.hasIncome ? child.annualIncome : 0,
    childcareArrangements: child.goesToChildcare ? child.childcareArrangements : [],
  }));

  nextValues.assets.childAssets1Jan = nextValues.children.reduce((sum, child) => sum + child.assets1Jan, 0);
  nextValues.assets.residentAssets1Jan = nextValues.residents.reduce((sum, resident) => sum + resident.assets1Jan, 0);

  return nextValues;
}

export function toHouseholdSnapshot(values: BenefitsFormValues): HouseholdSnapshot {
  const normalized = normalizeBenefitsValues(values);

  return {
    year: normalized.year,
    selectedBenefits: normalized.selectedBenefits,
    applicant: normalized.applicant,
    partner: normalized.hasPartner ? normalized.partner : null,
    children: normalized.children,
    residents: normalized.residents,
    housing: normalized.housing,
    assets: normalized.assets,
    specialSituations: normalized.specialSituations,
  };
}

export function getEligibleBenefitKeys(
  results: Record<BenefitCardKey, { eligible: boolean }>,
): BenefitCardKey[] {
  return (["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"] as const).filter(
    (key) => results[key].eligible,
  );
}
