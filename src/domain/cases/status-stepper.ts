import type { CaseStatus } from "@/types/database";

export type CaseStepperStatus = CaseStatus | "awaiting_docs";

export function mapCaseStatusToStep(status: CaseStepperStatus): number {
  switch (status) {
    case "draft":
      return 1;
    case "awaiting_docs":
    case "pending_documents":
      return 2;
    case "in_review":
    case "pending_payment":
    case "pending_authorization":
    case "authorized":
    case "paid":
    case "rejected":
      return 3;
    case "submitted":
      return 4;
    case "completed":
      return 5;
    default:
      return 1;
  }
}

export const CASE_STEPPER_STEPS: Array<{ id: string; label: string }> = [
  { id: "draft", label: "Start" },
  { id: "docs", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "submitted", label: "Submitted" },
  { id: "completed", label: "Completed" },
];
