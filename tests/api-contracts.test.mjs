import assert from "node:assert/strict";

import {
  STATUS_BY_ERROR_CODE,
  buildApiFailure,
  buildApiSuccess,
  parseDsarCreatePayload,
  parseIdParam,
  parseNotificationsLimit,
} from "../src/lib/api/contracts.ts";

function test(name, fn) {
  try {
    fn();
    console.log(`api-contracts: ${name} ok`);
  } catch (error) {
    console.error(`api-contracts: ${name} failed`);
    throw error;
  }
}

test("success envelope includes data and null error", () => {
  const payload = buildApiSuccess([{ id: "1" }], { limit: 10 });
  assert.deepEqual(payload, {
    data: [{ id: "1" }],
    error: null,
    meta: { limit: 10 },
  });
});

test("failure envelope includes code and optional message", () => {
  const payload = buildApiFailure("invalid_params", "bad_id");
  assert.deepEqual(payload, {
    data: null,
    error: {
      code: "invalid_params",
      message: "bad_id",
    },
  });
});

test("status map keeps stable API error semantics", () => {
  assert.equal(STATUS_BY_ERROR_CODE.unauthorized, 401);
  assert.equal(STATUS_BY_ERROR_CODE.invalid_payload, 400);
  assert.equal(STATUS_BY_ERROR_CODE.invalid_params, 400);
  assert.equal(STATUS_BY_ERROR_CODE.not_found, 404);
  assert.equal(STATUS_BY_ERROR_CODE.forbidden, 403);
  assert.equal(STATUS_BY_ERROR_CODE.conflict, 409);
  assert.equal(STATUS_BY_ERROR_CODE.internal, 500);
});

test("id param parser accepts uuid and rejects invalid values", () => {
  const valid = parseIdParam({ id: "9ef8ca6e-9783-43f4-a7f0-4ed536f8961d" });
  assert.equal(valid.success, true);

  const invalid = parseIdParam({ id: "not-a-uuid" });
  assert.equal(invalid.success, false);
});

test("notifications limit parser enforces 1..100", () => {
  const defaultLimit = parseNotificationsLimit({});
  assert.equal(defaultLimit.success, true);

  const validLimit = parseNotificationsLimit({ limit: "20" });
  assert.equal(validLimit.success, true);
  if (validLimit.success) {
    assert.equal(validLimit.data.limit, 20);
  }

  const tooLow = parseNotificationsLimit({ limit: "0" });
  assert.equal(tooLow.success, false);

  const tooHigh = parseNotificationsLimit({ limit: "101" });
  assert.equal(tooHigh.success, false);
});

test("dsar create payload parser enforces request type", () => {
  const valid = parseDsarCreatePayload({
    requestType: "export",
    details: { source: "settings_screen" },
  });
  assert.equal(valid.success, true);

  const invalid = parseDsarCreatePayload({
    requestType: "archive",
  });
  assert.equal(invalid.success, false);
});
