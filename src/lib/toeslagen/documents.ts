import type {
  BenefitKey,
  DocumentRequirement,
  HouseholdSnapshot,
  ToeslagenEvaluation,
} from "./types";

function createDocument(
  code: string,
  benefitKeys: BenefitKey[],
  severity: DocumentRequirement["severity"],
  appliesWhen: string[],
  required = severity !== "recommended",
): DocumentRequirement {
  return {
    code,
    labelKey: `Benefits.documents.${code}`,
    required,
    appliesWhen,
    benefitKeys,
    severity,
  };
}

function dedupeDocuments(items: DocumentRequirement[]) {
  const seen = new Map<string, DocumentRequirement>();
  for (const item of items) {
    const current = seen.get(item.code);
    if (!current) {
      seen.set(item.code, item);
      continue;
    }
    seen.set(item.code, {
      ...current,
      required: current.required || item.required,
      severity:
        current.severity === "manual_review" || item.severity === "manual_review"
          ? "manual_review"
          : current.severity === "required" || item.severity === "required"
            ? "required"
            : "recommended",
      appliesWhen: Array.from(new Set([...current.appliesWhen, ...item.appliesWhen])),
      benefitKeys: Array.from(new Set([...current.benefitKeys, ...item.benefitKeys])),
    });
  }
  return [...seen.values()];
}

export function getDocumentChecklistForBenefit(
  snapshot: HouseholdSnapshot,
  benefit: BenefitKey,
  evaluation?: ToeslagenEvaluation,
) {
  const baseDocs: DocumentRequirement[] = [
    createDocument("identity_document", [benefit], "required", ["all_applications"]),
    createDocument("bsn_applicant", [benefit], "required", ["all_applications"]),
    createDocument("iban", [benefit], "required", ["all_applications"]),
    createDocument("estimated_income_2026", [benefit], "required", ["all_applications"]),
    createDocument("recent_payslip_or_income_proof", [benefit], "required", ["all_applications"]),
    createDocument(
      "authorization_or_machtiging_if_assisted",
      [benefit],
      "recommended",
      ["assisted_application"],
    ),
  ];

  if (snapshot.partner) {
    baseDocs.push(
      createDocument("partner_details_if_applicable", [benefit], "required", ["partner_present"]),
    );
  }

  const items = [...baseDocs];

  if (benefit === "zorgtoeslag") {
    items.push(createDocument("health_insurance_policy_applicant", [benefit], "required", ["zorgtoeslag"]));
    if (snapshot.partner) {
      items.push(createDocument("health_insurance_policy_partner", [benefit], "required", ["partner_present"]));
    }
    items.push(createDocument("income_proof", [benefit], "required", ["zorgtoeslag"]));
    items.push(createDocument("assets_statement_if_near_limit", [benefit], "recommended", ["assets_near_limit"]));
    if (snapshot.specialSituations.foreignResidence || snapshot.specialSituations.cakInsured) {
      items.push(createDocument("cak_or_verdragsgerechtigde_proof", [benefit], "manual_review", ["foreign_or_cak_case"]));
    }
    if (
      snapshot.specialSituations.military ||
      snapshot.specialSituations.detained ||
      snapshot.specialSituations.gemoedsbezwaarde ||
      snapshot.specialSituations.noFixedAddress
    ) {
      items.push(createDocument("special_status_evidence", [benefit], "manual_review", ["special_status"]));
    }
  }

  if (benefit === "huurtoeslag") {
    items.push(createDocument("rental_contract", [benefit], "required", ["huurtoeslag"]));
    items.push(createDocument("basic_rent_proof", [benefit], "required", ["huurtoeslag"]));
    items.push(createDocument("landlord_rent_change_letter", [benefit], "recommended", ["rent_changed"]));
    items.push(createDocument("brp_registration_proof", [benefit], "recommended", ["address_confirmation_needed"]));
    items.push(createDocument("rent_payment_proof", [benefit], "required", ["huurtoeslag"]));
    if (snapshot.partner) {
      items.push(createDocument("partner_income_assets_proof", [benefit], "required", ["partner_present"]));
    }
    if (snapshot.residents.some((resident) => !resident.isSubtenant)) {
      items.push(createDocument("resident_income_assets_proof", [benefit], "required", ["medebewoners_present"]));
    }
    if (snapshot.residents.some((resident) => resident.isSubtenant)) {
      items.push(createDocument("subtenant_contract_and_bank_statements", [benefit], "required", ["subtenant_present"]));
    }
    if (snapshot.housing?.isWoonwagen) {
      items.push(createDocument("woonwagen_standplaats_proof", [benefit], "required", ["woonwagen_case"]));
    }
    if (snapshot.housing?.groupHousingForElderlyOrAssistedLiving) {
      items.push(createDocument("group_housing_recognition_proof", [benefit], "manual_review", ["group_housing_case"]));
    }
    if (snapshot.children.some((child) => child.isCoParentingChild)) {
      items.push(createDocument("co_parenting_agreement", [benefit], "recommended", ["co_parenting_child"]));
    }
    if (
      snapshot.specialSituations.bijzonderInkomen ||
      snapshot.specialSituations.bijzondereVermogen ||
      snapshot.specialSituations.longAbsenceFromHome ||
      snapshot.specialSituations.homeCareSituation
    ) {
      items.push(createDocument("special_income_assets_manual_review_proof", [benefit], "manual_review", ["special_huur_case"]));
    }
  }

  if (benefit === "kindgebondenBudget") {
    items.push(createDocument("child_bsn", [benefit], "required", ["child_present"]));
    items.push(createDocument("child_birth_date", [benefit], "required", ["child_present"]));
    items.push(createDocument("svb_kinderbijslag_proof", [benefit], "required", ["child_present"]));
    items.push(createDocument("assets_1_january", [benefit], "required", ["kgb"]));
    if (snapshot.partner) {
      items.push(createDocument("partner_income_proof", [benefit], "required", ["partner_present"]));
    }
    if (snapshot.children.some((child) => child.isCoParentingChild)) {
      items.push(createDocument("co_parenting_agreement", [benefit], "recommended", ["co_parenting_child"]));
    }
    if (snapshot.specialSituations.composedFamily) {
      items.push(createDocument("composed_family_documents", [benefit], "manual_review", ["composed_family"]));
    }
    if (snapshot.specialSituations.childAbroad) {
      items.push(createDocument("child_abroad_residence_and_woonlandfactor_documents", [benefit], "manual_review", ["child_abroad"]));
    }
    if (snapshot.specialSituations.adoptionFosterStepChild) {
      items.push(createDocument("foster_step_adoption_documents", [benefit], "recommended", ["family_status_exception"]));
    }
    if (snapshot.assets.childAssets1Jan > 0) {
      items.push(createDocument("child_assets_proof", [benefit], "recommended", ["child_assets_present"]));
    }
  }

  if (benefit === "kinderopvangtoeslag") {
    items.push(createDocument("childcare_contract", [benefit], "required", ["kot"]));
    items.push(createDocument("lrk_number", [benefit], "required", ["kot"]));
    items.push(createDocument("provider_name_address", [benefit], "required", ["kot"]));
    items.push(createDocument("childcare_type", [benefit], "required", ["kot"]));
    items.push(createDocument("start_end_date", [benefit], "required", ["kot"]));
    items.push(createDocument("monthly_hours", [benefit], "required", ["kot"]));
    items.push(createDocument("hourly_rate", [benefit], "required", ["kot"]));
    items.push(createDocument("invoices", [benefit], "required", ["kot"]));
    items.push(createDocument("bank_payment_proof", [benefit], "required", ["kot"]));
    items.push(createDocument("child_bsn", [benefit], "required", ["child_present"]));
    items.push(createDocument("applicant_income_proof", [benefit], "required", ["kot"]));
    if (snapshot.partner) {
      items.push(createDocument("partner_income_activity_proof", [benefit], "required", ["partner_present"]));
    }
    if (snapshot.applicant.activityStatus.includes("employed") || snapshot.partner?.activityStatus.includes("employed")) {
      items.push(createDocument("employment_contract_or_payslip", [benefit], "required", ["employment_activity"]));
    }
    if (snapshot.applicant.activityStatus.includes("selfEmployed") || snapshot.partner?.activityStatus.includes("selfEmployed")) {
      items.push(createDocument("zzp_kvk_invoices_bookkeeping_hours", [benefit], "required", ["self_employed_activity"]));
    }
    if (snapshot.applicant.activityStatus.includes("studentRecognized") || snapshot.partner?.activityStatus.includes("studentRecognized")) {
      items.push(createDocument("education_enrollment_proof", [benefit], "required", ["student_activity"]));
    }
    if (snapshot.applicant.activityStatus.includes("inburgeringCourse") || snapshot.partner?.activityStatus.includes("inburgeringCourse")) {
      items.push(createDocument("inburgering_course_proof", [benefit], "required", ["inburgering_activity"]));
    }
    if (
      snapshot.applicant.activityStatus.includes("trajectoryToWork") ||
      snapshot.applicant.activityStatus.includes("workReintegration") ||
      snapshot.partner?.activityStatus.includes("trajectoryToWork") ||
      snapshot.partner?.activityStatus.includes("workReintegration")
    ) {
      items.push(createDocument("uwv_or_municipality_trajectory_proof", [benefit], "required", ["trajectory_activity"]));
    }
    if (snapshot.children.some((child) => child.isCoParentingChild)) {
      items.push(createDocument("co_parenting_agreement", [benefit], "recommended", ["co_parenting_child"]));
    }
    if (snapshot.specialSituations.childcareAbroad) {
      items.push(createDocument("foreign_childcare_registration", [benefit], "manual_review", ["foreign_childcare"]));
    }
    if (
      snapshot.children.some((child) =>
        child.childcareArrangements.some((arrangement) => arrangement.providerType === "gastouder"),
      )
    ) {
      items.push(createDocument("gastouderbureau_contract_and_invoices", [benefit], "required", ["gastouder"]));
    }
    items.push(createDocument("change_letter_for_hours_or_rate", [benefit], "recommended", ["hours_or_rate_changes"]));
  }

  const deduped = dedupeDocuments(items);
  const manualReview = evaluation?.results[benefit].manualReviewRequired ?? false;

  return {
    requiredDocuments: deduped.filter((item) => item.severity !== "recommended"),
    optionalDocuments: deduped.filter(
      (item) => item.severity === "recommended" || (manualReview && item.severity === "manual_review"),
    ),
  };
}
