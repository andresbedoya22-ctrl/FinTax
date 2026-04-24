import type { ChildSnapshot, HouseholdSnapshot, NormalizedHousehold, PartnerSnapshot, PersonSnapshot, ResidentSnapshot } from "../types";

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
  const hasPartner = Boolean(snapshot.partner?.isToeslagPartner);
  const relevantResidents = snapshot.residents.filter(
    (resident) => !(resident.isSubtenant && resident.hasSubrentContract),
  );
  const residentChildren = snapshot.children.filter((child) => child.livesWithApplicant || child.isCoParentingChild);
  const householdMembers = [snapshot.applicant, ...(hasPartner && snapshot.partner ? [snapshot.partner] : []), ...relevantResidents];
  const oldestHouseholdMemberAge = Math.max(
    ...householdMembers.map((person) => parseAgeOn2026(person.birthDate)),
  );

  return {
    snapshot,
    hasPartner,
    jointIncome: snapshot.applicant.annualIncome + (hasPartner && snapshot.partner ? snapshot.partner.annualIncome : 0),
    jointAssets:
      sumPeopleAssets([snapshot.applicant, ...(hasPartner && snapshot.partner ? [snapshot.partner] : [])]) +
      snapshot.assets.childAssets1Jan +
      snapshot.assets.residentAssets1Jan,
    householdSizeForRent: 1 + (hasPartner && snapshot.partner ? 1 : 0) + relevantResidents.length + residentChildren.length,
    oldestHouseholdMemberAge,
  };
}
