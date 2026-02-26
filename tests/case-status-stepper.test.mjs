import test from "node:test";
import assert from "node:assert/strict";

import { mapCaseStatusToStep } from "../src/domain/cases/status-stepper.ts";

test("maps required statuses to expected step numbers", () => {
  assert.equal(mapCaseStatusToStep("draft"), 1);
  assert.equal(mapCaseStatusToStep("awaiting_docs"), 2);
  assert.equal(mapCaseStatusToStep("in_review"), 3);
  assert.equal(mapCaseStatusToStep("pending_payment"), 4);
  assert.equal(mapCaseStatusToStep("completed"), 5);
});

