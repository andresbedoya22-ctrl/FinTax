import type {
  ActivityStatus,
  AssetsSnapshot,
  ChildcareArrangement,
  ChildSnapshot,
  HouseholdSnapshot,
  HousingSnapshot,
  NormalizedHousehold,
  PartnerSnapshot,
  PersonSnapshot,
  ResidentSnapshot,
  SpecialSituationsSnapshot,
} from "../types";

const VALID_ACTIVITY_STATUSES: ActivityStatus[] = [
  "employed",
  "selfEmployed",
  "studentRecognized",
  "inburgeringCourse",
  "workReintegration",
  "trajectoryToWork",
  "unemployed",
  "none",
  "unknown",
];

const validActivityStatusSet = new Set<ActivityStatus>(VALID_ACTIVITY_STATUSES);

export const DEFAULT_ASSETS_SNAPSHOT: AssetsSnapshot = {
  applicantAssets1Jan: 0,
  partnerAssets1Jan: 0,
  childAssets1Jan: 0,
  residentAssets1Jan: 0,
  hasSpecialAssets: false,
};

export const DEFAULT_FALSE_SPECIAL_SITUATIONS: SpecialSituationsSnapshot = {
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
};

export const DEFAULT_HOUSING_SNAPSHOT: HousingSnapshot = {
  rentsRoom: false,
  independentHome: false,
  groupHousingForElderlyOrAssistedLiving: false,
  recognizedException: false,
  hasRentalContract: false,
  basicMonthlyRent: 0,
  isWoonwagen: false,
  monthlyStandplaatsCost: 0,
  serviceCostsIncludedButIgnoredFrom2026: 0,
};

function normalizeActivityStatus(value: unknown): ActivityStatus[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((status): status is ActivityStatus => typeof status === "string" && validActivityStatusSet.has(status as ActivityStatus));
}

function normalizeChildcareArrangement(arrangement: ChildcareArrangement): ChildcareArrangement {
  return {
    ...arrangement,
    registeredLrk: arrangement.registeredLrk ?? false,
    monthlyHours: arrangement.monthlyHours ?? 0,
    hourlyRate: arrangement.hourlyRate ?? 0,
    hasContract: arrangement.hasContract ?? false,
    parentsPayContribution: arrangement.parentsPayContribution ?? false,
  };
}

function normalizeChild(child: ChildSnapshot): ChildSnapshot {
  return {
    ...child,
    livesWithApplicant: child.livesWithApplicant ?? false,
    isCoParentingChild: child.isCoParentingChild ?? false,
    daysPerYearWithApplicant: child.daysPerYearWithApplicant ?? 0,
    receivesKinderbijslag: child.receivesKinderbijslag ?? false,
    hasIncome: child.hasIncome ?? false,
    annualIncome: child.annualIncome ?? 0,
    assets1Jan: child.assets1Jan ?? 0,
    goesToChildcare: child.goesToChildcare ?? false,
    childcareArrangements: Array.isArray(child.childcareArrangements)
      ? child.childcareArrangements.map(normalizeChildcareArrangement)
      : [],
  };
}

function normalizeResident(resident: ResidentSnapshot): ResidentSnapshot {
  return {
    ...resident,
    sameAddressRegistered: resident.sameAddressRegistered ?? false,
    annualIncome: resident.annualIncome ?? 0,
    assets1Jan: resident.assets1Jan ?? 0,
    isSubtenant: resident.isSubtenant ?? false,
    hasSubrentContract: resident.hasSubrentContract ?? false,
  };
}

function normalizePerson<TPerson extends PersonSnapshot | PartnerSnapshot>(person: TPerson): TPerson {
  return {
    ...person,
    bsnKnown: person.bsnKnown ?? false,
    annualIncome: person.annualIncome ?? 0,
    assets1Jan: person.assets1Jan ?? 0,
    hasDutchHealthInsurance: person.hasDutchHealthInsurance ?? false,
    activityStatus: normalizeActivityStatus(person.activityStatus),
  };
}

export function coerceHouseholdSnapshot(snapshot: HouseholdSnapshot): HouseholdSnapshot {
  const applicant = normalizePerson(snapshot.applicant);
  const partner = snapshot.partner ? normalizePerson(snapshot.partner) : null;
  const children = Array.isArray(snapshot.children) ? snapshot.children.map(normalizeChild) : [];
  const residents = Array.isArray(snapshot.residents) ? snapshot.residents.map(normalizeResident) : [];
  const assets = { ...DEFAULT_ASSETS_SNAPSHOT, ...(snapshot.assets ?? {}) };
  const specialSituations = {
    ...DEFAULT_FALSE_SPECIAL_SITUATIONS,
    ...(snapshot.specialSituations ?? {}),
  };
  const housing = snapshot.housing ? { ...DEFAULT_HOUSING_SNAPSHOT, ...snapshot.housing } : { ...DEFAULT_HOUSING_SNAPSHOT };
  const selectedBenefits = Array.isArray(snapshot.selectedBenefits) ? Array.from(new Set(snapshot.selectedBenefits)) : [];

  return {
    ...snapshot,
    applicant,
    partner,
    selectedBenefits,
    children,
    residents,
    housing,
    assets,
    specialSituations,
  };
}

function parseAgeOn2026(date: string) {
  const birthDate = new Date(`${date}T00:00:00.000Z`);
  const reference = new Date("2026-01-01T00:00:00.000Z");
  let age = reference.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    reference.getUTCMonth() < birthDate.getUTCMonth() ||
    (reference.getUTCMonth() === birthDate.getUTCMonth() && reference.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) {
    age -= 1;
  }
  return age;
}

export function getAgeOnReferenceDate(date: string) {
  return parseAgeOn2026(date);
}

function sumPeopleAssets(people: Array<PersonSnapshot | PartnerSnapshot | ResidentSnapshot | ChildSnapshot>) {
  return people.reduce((total, person) => total + Math.max(0, person.assets1Jan), 0);
}

export function normalizeHousehold(snapshot: HouseholdSnapshot): NormalizedHousehold {
  const safeSnapshot = coerceHouseholdSnapshot(snapshot);
  const hasPartner = Boolean(safeSnapshot.partner?.isToeslagPartner);
  const relevantResidents = safeSnapshot.residents.filter(
    (resident) => !(resident.isSubtenant && resident.hasSubrentContract),
  );
  const residentChildren = safeSnapshot.children.filter((child) => child.livesWithApplicant || child.isCoParentingChild);
  const householdMembers = [safeSnapshot.applicant, ...(hasPartner && safeSnapshot.partner ? [safeSnapshot.partner] : []), ...relevantResidents];
  const oldestHouseholdMemberAge = Math.max(
    ...householdMembers.map((person) => parseAgeOn2026(person.birthDate)),
  );

  return {
    snapshot: safeSnapshot,
    hasPartner,
    jointIncome: safeSnapshot.applicant.annualIncome + (hasPartner && safeSnapshot.partner ? safeSnapshot.partner.annualIncome : 0),
    jointAssets:
      sumPeopleAssets([safeSnapshot.applicant, ...(hasPartner && safeSnapshot.partner ? [safeSnapshot.partner] : [])]) +
      safeSnapshot.assets.childAssets1Jan +
      safeSnapshot.assets.residentAssets1Jan,
    householdSizeForRent: 1 + (hasPartner && safeSnapshot.partner ? 1 : 0) + relevantResidents.length + residentChildren.length,
    oldestHouseholdMemberAge,
  };
}
