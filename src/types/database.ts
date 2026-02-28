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

export type DocumentStatus = "uploaded" | "under_review" | "approved" | "rejected";

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
  deadline: string | null;
  estimated_refund: number | null;
  actual_refund: number | null;
  paid_at?: string | null;
  wizard_data: Record<string, unknown>;
  wizard_completed: boolean;
  machtiging_status: MachtigingStatus;
  machtiging_code: string | null;
  stripe_payment_id: string | null;
  assigned_admin: string | null;
  notes_internal: string | null;
  created_at: string;
  updated_at: string;
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
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
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
