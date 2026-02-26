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
      return 3;
    case "pending_payment":
      return 4;
    case "paid":
    case "pending_authorization":
    case "authorized":
    case "submitted":
    case "completed":
    case "rejected":
      return 5;
    default:
      return 1;
  }
}

export const CASE_STEPPER_STEPS = [
  { id: "draft", label: "Created" },
  { id: "docs", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Done" },
] as const;

