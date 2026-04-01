import type { CaseStatus } from "@/types/database";

const TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  draft: ["pending_payment", "pending_documents", "in_review", "rejected"],
  pending_payment: ["paid", "rejected"],
  paid: ["pending_authorization", "in_review", "pending_documents", "rejected"],
  pending_authorization: ["authorized", "pending_documents", "rejected"],
  authorized: ["in_review", "pending_documents", "rejected"],
  in_review: ["pending_documents", "submitted", "completed", "rejected"],
  pending_documents: ["in_review", "pending_authorization", "rejected"],
  submitted: ["completed", "rejected"],
  completed: [],
  rejected: [],
};

export function canTransitionCaseStatus(from: CaseStatus, to: CaseStatus) {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function getAllowedCaseTransitions(status: CaseStatus) {
  return [status, ...TRANSITIONS[status]];
}
