export type CaseType =
  | "tax_return_m"
  | "tax_return_p"
  | "tax_return_c"
  | "tax_return_w"
  | "btw_declaration"
  | "zorgtoeslag"
  | "huurtoeslag"
  | "kindgebonden_budget"
  | "kinderopvangtoeslag";

export type CaseStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "pending_authorization"
  | "authorized"
  | "in_review"
  | "pending_documents"
  | "submitted"
  | "completed"
  | "rejected";

export type DocumentStatus =
  | "uploading"
  | "uploaded"
  | "under_review"
  | "approved"
  | "rejected"
  | "replaced"
  | "archived";

export type RequirementType = "info" | "document" | "boolean" | "date" | "list" | "confirmation";

export type RequirementStatus = "pending" | "uploaded" | "approved" | "rejected" | "waived" | "not_applicable";

export type NotificationType = "info" | "success" | "warning" | "error" | "action_required";

export type MachtigingStatus =
  | "not_started"
  | "requested"
  | "code_received"
  | "activated"
  | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  bsn_encrypted: string | null;
  bsn_key_id: string | null;
  bsn_ciphertext: string | null;
  nationality: string | null;
  country_of_origin: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string;
  preferred_language: "en" | "nl" | "es" | "pl" | "ro";
  avatar_url: string | null;
  theme: "dark" | "light";
  notification_email: boolean;
  notification_in_app: boolean;
  onboarding_completed: boolean;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  case_type: CaseType;
  status: CaseStatus;
  display_name: string | null;
  tax_year: number | null;
  origin_country_code?: string | null;
  residency_pattern?: string | null;
  filing_route?: string | null;
  deadline: string | null;
  estimated_refund: number | null;
  actual_refund: number | null;
  paid_at?: string | null;
  wizard_data: Record<string, unknown>;
  wizard_completed: boolean;
  current_intake_snapshot_id?: string | null;
  active_rule_set_id?: string | null;
  requirements_completion_ratio?: number;
  blocking_requirements_count?: number;
  requirements_summary?: Record<string, unknown>;
  last_client_submission_at?: string | null;
  last_requirement_refresh_at?: string | null;
  machtiging_status: MachtigingStatus;
  machtiging_code: string | null;
  stripe_payment_id: string | null;
  assigned_admin: string | null;
  notes_internal: string | null;
  legal_hold?: boolean;
  legal_hold_reason?: string | null;
  legal_hold_set_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCase extends Case {
  profile: Pick<Profile, "full_name" | "email" | "preferred_language"> | null;
}

export interface ChecklistItem {
  id: string;
  case_id: string;
  label: string;
  label_key: string | null;
  description: string | null;
  is_document_upload: boolean;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  document_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Document {
  id: string;
  case_id: string;
  user_id: string;
  checklist_item_id: string | null;
  upload_session_id?: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  storage_provider?: string;
  storage_bucket?: string | null;
  storage_object_key?: string | null;
  sha256_checksum?: string | null;
  upload_state?: "uploading" | "uploaded" | "finalized" | "replaced" | "deleted";
  replaced_by_document_id?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  metadata?: Record<string, unknown>;
  status: DocumentStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  legal_hold?: boolean;
  legal_hold_reason?: string | null;
  legal_hold_set_at?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  case_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  case_id: string;
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  payment_method: string | null;
  legal_hold?: boolean;
  legal_hold_reason?: string | null;
  legal_hold_set_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type DsarRequestType = "export" | "rectify" | "delete";
export type DsarRequestStatus = "open" | "in_progress" | "completed" | "rejected" | "cancelled";

export interface DsarRequest {
  id: string;
  user_id: string;
  request_type: DsarRequestType;
  status: DsarRequestStatus;
  requested_payload: Record<string, unknown>;
  resolution_notes: string | null;
  due_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RetentionPolicy {
  entity_name: string;
  retention_days: number;
  enabled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicePricing {
  id: string;
  case_type: CaseType;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  case_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface CaseIntakeSnapshot {
  id: string;
  case_id: string;
  schema_version: string;
  normalization_version: string;
  source: "wizard" | "admin" | "migration" | "api";
  payload: Record<string, unknown>;
  derived_facts: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface RequirementHelpContent {
  id: string;
  requirement_code: string;
  version: string;
  locale: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseRequirement {
  id: string;
  case_id: string;
  template_id: string | null;
  snapshot_id: string;
  rule_set_id: string;
  requirement_code: string;
  instance_key: string;
  section: string;
  requirement_type: RequirementType;
  title: string;
  description: string | null;
  help_content: Record<string, unknown>;
  status: RequirementStatus;
  is_blocking: boolean;
  is_document_required: boolean;
  min_files: number;
  max_files: number | null;
  accepted_mime_types: string[];
  max_file_size_bytes: number;
  sort_order: number;
  applicability_reason: Record<string, unknown>;
  answer_value: Record<string, unknown>;
  customer_note: string | null;
  availability_status: "available" | "not_yet_available";
  availability_note: string | null;
  availability_marked_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  requested_at: string;
  first_completed_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadSession {
  id: string;
  case_id: string;
  requirement_id: string;
  user_id: string;
  intended_filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  replaces_document_id: string | null;
  status: "issued" | "uploaded" | "expired" | "finalized" | "cancelled";
  expires_at: string;
  created_at: string;
  finalized_at: string | null;
}

export interface RequirementDocument {
  id: string;
  requirement_id: string;
  document_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  actor_type: "user" | "admin" | "system";
  actor_id: string | null;
  event_type: string;
  visibility: "internal" | "client" | "both";
  payload: Record<string, unknown>;
  created_at: string;
}
