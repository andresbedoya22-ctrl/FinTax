import assert from "node:assert/strict";

import { mapCaseStatusToStep } from "../src/domain/cases/status-stepper.ts";

assert.equal(mapCaseStatusToStep("draft"), 1);
assert.equal(mapCaseStatusToStep("awaiting_docs"), 2);
assert.equal(mapCaseStatusToStep("in_review"), 3);
assert.equal(mapCaseStatusToStep("pending_payment"), 4);
assert.equal(mapCaseStatusToStep("completed"), 5);

console.log("case-status-stepper: ok");

