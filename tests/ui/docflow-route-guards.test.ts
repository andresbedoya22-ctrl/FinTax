import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthedUserMock = vi.fn();
const requireAdminUserMock = vi.fn();
const createAdminClientMock = vi.fn();
const getOwnedCaseOrNullMock = vi.fn();
const getCaseForAdminOrNullMock = vi.fn();
const listCaseRequirementsMock = vi.fn();
const createUploadSessionMock = vi.fn();
const addRequirementCustomerNoteMock = vi.fn();
const markRequirementNotYetAvailableMock = vi.fn();
const reviewDocumentMock = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  requireAuthedUser: (...args: unknown[]) => requireAuthedUserMock(...args),
  requireAdminUser: (...args: unknown[]) => requireAdminUserMock(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: (...args: unknown[]) => createAdminClientMock(...args),
}));

vi.mock("@/lib/tax-documents/service", () => ({
  getOwnedCaseOrNull: (...args: unknown[]) => getOwnedCaseOrNullMock(...args),
  getCaseForAdminOrNull: (...args: unknown[]) => getCaseForAdminOrNullMock(...args),
  listCaseRequirements: (...args: unknown[]) => listCaseRequirementsMock(...args),
  createUploadSession: (...args: unknown[]) => createUploadSessionMock(...args),
  addRequirementCustomerNote: (...args: unknown[]) => addRequirementCustomerNoteMock(...args),
  markRequirementNotYetAvailable: (...args: unknown[]) => markRequirementNotYetAvailableMock(...args),
  reviewDocument: (...args: unknown[]) => reviewDocumentMock(...args),
}));

describe("docflow route guards", () => {
  const caseId = "11111111-1111-4111-8111-111111111111";
  const requirementId = "22222222-2222-4222-8222-222222222222";
  const missingRequirementId = "33333333-3333-4333-8333-333333333333";
  const documentId = "44444444-4444-4444-8444-444444444444";

  beforeEach(() => {
    requireAuthedUserMock.mockResolvedValue({ user: { id: "user-1" } });
    requireAdminUserMock.mockResolvedValue({ user: { id: "admin-1" } });
    createAdminClientMock.mockResolvedValue({});
    getOwnedCaseOrNullMock.mockResolvedValue({ id: caseId, user_id: "user-1" });
    getCaseForAdminOrNullMock.mockResolvedValue({ id: caseId });
    listCaseRequirementsMock.mockResolvedValue([{ id: requirementId }]);
  });

  it("maps replace target conflicts during upload-session creation", async () => {
    const { POST } = await import("@/app/api/cases/[id]/documents/upload-session/route");
    createUploadSessionMock.mockRejectedValueOnce(new Error("replace_document_not_allowed"));

    const response = (await POST(
      new Request(`http://localhost/api/cases/${caseId}/documents/upload-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId,
          fileName: "passport.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 100,
          replacesDocumentId: documentId,
        }),
      }),
      { params: Promise.resolve({ id: caseId }) },
    ))!;

    expect(response.status).toBe(409);
  });

  it("returns not found when saving a note to a missing requirement", async () => {
    const { POST } = await import("@/app/api/cases/[id]/requirements/[requirementId]/note/route");
    addRequirementCustomerNoteMock.mockRejectedValueOnce(new Error("requirement_not_found"));

    const response = (await POST(
      new Request(`http://localhost/api/cases/${caseId}/requirements/${missingRequirementId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Waiting for HR" }),
      }),
      { params: Promise.resolve({ id: caseId, requirementId: missingRequirementId }) },
    ))!;

    expect(response.status).toBe(404);
  });

  it("returns not found when marking not available on a missing requirement", async () => {
    const { POST } = await import("@/app/api/cases/[id]/requirements/[requirementId]/not-available/route");
    markRequirementNotYetAvailableMock.mockRejectedValueOnce(new Error("requirement_not_found"));

    const response = (await POST(
      new Request(`http://localhost/api/cases/${caseId}/requirements/${missingRequirementId}/not-available`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Still waiting" }),
      }),
      { params: Promise.resolve({ id: caseId, requirementId: missingRequirementId }) },
    ))!;

    expect(response.status).toBe(404);
  });

  it("rejects admin review on replaced or archived documents", async () => {
    const { PATCH } = await import("@/app/api/admin/cases/[id]/documents/[documentId]/route");
    reviewDocumentMock.mockRejectedValueOnce(new Error("document_review_invalid_state"));

    const response = (await PATCH(
      new Request(`http://localhost/api/admin/cases/${caseId}/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", reviewNotes: "Already replaced" }),
      }),
      { params: Promise.resolve({ id: caseId, documentId }) },
    ))!;

    expect(response.status).toBe(409);
  });
});
