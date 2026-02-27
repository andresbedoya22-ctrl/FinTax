import assert from "node:assert/strict";

import { mapCaseStatusToStep } from "../src/domain/cases/status-stepper.ts";
import {
  buildApiFailure,
  buildApiSuccess,
  parseIdParam,
  parseNotificationsLimit,
  STATUS_BY_ERROR_CODE,
} from "../src/lib/api/contracts.ts";

assert.equal(mapCaseStatusToStep("draft"), 1);
assert.equal(mapCaseStatusToStep("awaiting_docs"), 2);
assert.equal(mapCaseStatusToStep("in_review"), 3);
assert.equal(mapCaseStatusToStep("pending_payment"), 4);
assert.equal(mapCaseStatusToStep("completed"), 5);

const okEnvelope = buildApiSuccess({ id: "1" }, { page: 1 });
assert.deepEqual(okEnvelope, {
  data: { id: "1" },
  error: null,
  meta: { page: 1 },
});

const failEnvelope = buildApiFailure("invalid_params", "bad_id");
assert.deepEqual(failEnvelope, {
  data: null,
  error: { code: "invalid_params", message: "bad_id" },
});

assert.equal(STATUS_BY_ERROR_CODE.unauthorized, 401);
assert.equal(STATUS_BY_ERROR_CODE.not_found, 404);

assert.equal(parseIdParam({ id: "97a72cbf-7ef4-486f-a4b1-28db53f4f06f" }).success, true);
assert.equal(parseIdParam({ id: "abc" }).success, false);

assert.equal(parseNotificationsLimit({ limit: "8" }).success, true);
assert.equal(parseNotificationsLimit({ limit: "0" }).success, false);

console.log("case-status-stepper: ok");
