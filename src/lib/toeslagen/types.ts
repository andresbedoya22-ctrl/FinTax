import type { ReasonCode } from "./reasons";

export type BenefitKey =
  | "zorgtoeslag"
  | "huurtoeslag"
  | "kindgebondenBudget"
  | "kinderopvangtoeslag";

export type ActivityStatus =
  | "employed"
  | "selfEmployed"
  | "studentRecognized"
  | "inburgeringCourse"
  | "workReintegration"
  | "trajectoryToWork"
  | "unemployed"
  | "none"
  | "unknown";

export type CalculationStep = {
  code: string;
  labelKey: string;
  value: number | string | boolean | null;
  formula?: string;
};

export type DocumentRequirement = {
  code: string;
  labelKey: string;
  required: boolean;
  appliesWhen: string[];
  benefitKeys: BenefitKey[];
  severity: "required" | "recommended" | "manual_review";
};

export type BenefitEvaluationResult = {
  benefit: BenefitKey;
  eligible: boolean;
  manualReviewRequired: boolean;
  estimatedAnnualAmount: number | null;
  estimatedMonthlyAmount: number | null;
  blockingReasons: ReasonCode[];
  warningReasons: ReasonCode[];
  calculationSteps: CalculationStep[];
  requiredDocuments: DocumentRequirement[];
  optionalDocuments: DocumentRequirement[];
};

export type ToeslagenEvaluation = {
  year: 2026;
  parameterSetVersion: "NL_TOESLAGEN_2026_V1";
  results: Record<BenefitKey, BenefitEvaluationResult>;
  totalEstimatedAnnualAmount: number;
  totalEstimatedMonthlyAmount: number;
  manualReviewRequired: boolean;
};

export type PersonSnapshot = {
  id: string;
  birthDate: string;
  countryOfResidence: string;
  nlResident: boolean;
  bsnKnown?: boolean;
  annualIncome: number;
  assets1Jan: number;
  hasDutchHealthInsurance?: boolean;
  activityStatus: ActivityStatus[];
};

export type PartnerSnapshot = PersonSnapshot & {
  sameAddress: boolean;
  isToeslagPartner: boolean;
};

export type ChildcareArrangement = {
  id: string;
  childcareKind: "dagopvang" | "buitenschoolseOpvang" | "tussenschoolseOpvang";
  providerType: "kindercentrum" | "gastouder";
  registeredLrk: boolean;
  lrkNumber?: string;
  monthlyHours: number;
  hourlyRate: number;
  startDate?: string;
  endDate?: string;
  hasContract?: boolean;
  parentsPayContribution?: boolean;
};

export type ChildSnapshot = {
  id: string;
  birthDate: string;
  livesWithApplicant: boolean;
  isCoParentingChild: boolean;
  daysPerYearWithApplicant: number;
  receivesKinderbijslag: boolean;
  hasIncome: boolean;
  annualIncome: number;
  assets1Jan: number;
  goesToChildcare: boolean;
  bsnKnown?: boolean;
  childcareArrangements: ChildcareArrangement[];
};

export type ResidentSnapshot = {
  id: string;
  birthDate: string;
  relationship: string;
  sameAddressRegistered: boolean;
  annualIncome: number;
  assets1Jan: number;
  isSubtenant: boolean;
  hasSubrentContract: boolean;
};

export type HousingSnapshot = {
  rentsRoom: boolean;
  independentHome: boolean;
  groupHousingForElderlyOrAssistedLiving: boolean;
  recognizedException: boolean;
  hasRentalContract: boolean;
  basicMonthlyRent: number;
  isWoonwagen: boolean;
  monthlyStandplaatsCost: number;
  serviceCostsIncludedButIgnoredFrom2026: number;
};

export type AssetsSnapshot = {
  applicantAssets1Jan: number;
  partnerAssets1Jan: number;
  childAssets1Jan: number;
  residentAssets1Jan: number;
  hasSpecialAssets: boolean;
};

export type SpecialSituationsSnapshot = {
  foreignResidence: boolean;
  foreignWork: boolean;
  childAbroad: boolean;
  childcareAbroad: boolean;
  cakInsured: boolean;
  military: boolean;
  detained: boolean;
  gemoedsbezwaarde: boolean;
  noFixedAddress: boolean;
  bijzondereVermogen: boolean;
  bijzonderInkomen: boolean;
  longAbsenceFromHome: boolean;
  homeCareSituation: boolean;
  composedFamily: boolean;
  adoptionFosterStepChild: boolean;
  manualReviewNotes: string;
};

export type HouseholdSnapshot = {
  year: 2026;
  selectedBenefits: BenefitKey[];
  applicant: PersonSnapshot;
  partner?: PartnerSnapshot | null;
  children: ChildSnapshot[];
  residents: ResidentSnapshot[];
  housing?: HousingSnapshot | null;
  assets: AssetsSnapshot;
  specialSituations: SpecialSituationsSnapshot;
};

export type ToeslagenParameters = {
  version: "NL_TOESLAGEN_2026_V1";
  year: 2026;
  sources: Array<{ label: string; url: string; accessedAt: string }>;
  zorgtoeslag: {
    minAge: number;
    maxIncomeSingle: number;
    maxIncomeWithPartner: number;
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    standaardpremiePerInsured: number;
    standaardpremiePair: number;
    drempelinkomen: number;
    normpremieSingleBaseRate: number;
    normpremiePartnerBaseRate: number;
    normpremieExcessRate: number;
  };
  huurtoeslag: {
    minAge: number;
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    maxAssetsPerMedebewoner: number;
    maxRentCalculationGeneral: number;
    maxRentCalculationYoung: number;
    youngHouseholdAgeLimit: number;
    basishuurOnePerson: number;
    basishuurTwoOrMorePersons: number;
    kwaliteitskortingsgrens: number;
    aftoppingsgrensOneOrTwoPersons: number;
    aftoppingsgrensThreeOrMorePersons: number;
    inkomensijkpuntOnePerson: number;
    inkomensijkpuntTwoOrMorePersons: number;
    incomeReductionRateOnePerson: number;
    incomeReductionRateTwoOrMorePersons: number;
    childrenUnder23IncomeExemption: number;
  };
  kindgebondenBudget: {
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    thresholdSingle: number;
    thresholdWithPartner: number;
    reductionRate: number;
    baseWithoutPartner: {
      oneChild: number;
      twoChildren: number;
      extraChild: number;
    };
    baseWithPartner: {
      oneChild: number;
      twoChildren: number;
      extraChild: number;
    };
    ageAddition12To15: number;
    ageAddition16To17: number;
  };
  kinderopvangtoeslag: {
    maxHoursPerChildPerMonth: number;
    maxHoursPerYear: number;
    maxRateDagopvangKindercentrum: number;
    maxRateBuitenschoolseOpvangKindercentrum: number;
    maxRateGastouderopvang: number;
    maxCoverageIncomeUntil: number;
    highCoverageRate: number;
  };
};

export type KOTPercentageBand = {
  minIncome: number;
  maxIncome: number | null;
  firstChildRate: number;
  nextChildRate: number;
};

export type NormalizedHousehold = {
  snapshot: HouseholdSnapshot;
  hasPartner: boolean;
  jointIncome: number;
  jointAssets: number;
  householdSizeForRent: number;
  oldestHouseholdMemberAge: number;
};
