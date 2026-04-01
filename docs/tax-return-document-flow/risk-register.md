# Risk Register

## Method

This register focuses on the risks explicitly relevant to this phase:

- security,
- data integrity,
- privacy,
- product correctness,
- UX trust,
- operational review quality.

Severity scale:

- High: can create security exposure, data loss, or materially incorrect tax workflow.
- Medium: can degrade operations or mislead users.
- Low: non-blocking but should be addressed as implementation proceeds.

## Risks

### R-01 Insecure or under-validated uploads

Severity: High

Current state:

- no real upload endpoint exists,
- client-side MIME and size filtering in `CaseDetailView.tsx` is not authoritative.

Mitigation:

- require server-issued upload sessions,
- validate size, MIME, extension, ownership, and requirement binding server-side,
- restrict allowed formats by requirement template,
- store checksum and upload session provenance,
- use private bucket and short-lived access URLs.

### R-02 Case/document isolation drift

Severity: High

Current state:

- document table has RLS,
- but upload transport and storage policy are not implemented or documented.

Mitigation:

- private bucket only,
- storage path namespaced by `user_id/case_id/requirement_id`,
- signed URLs or server proxy only,
- verify case ownership before issuing any upload or download session.

### R-03 Checklist duplication and inconsistency

Severity: High

Current state:

- wizard shows derived checklist,
- case detail shows persisted checklist,
- dashboard may use fallback checklist text.

Mitigation:

- backend-generated `case_requirements` becomes the only checklist authority,
- dashboard and case detail both consume same endpoint,
- wizard stops presenting a faux authoritative checklist.

### R-04 Hardcoded or weak tax-year logic

Severity: High

Current state:

- tax year is mostly display metadata,
- not tied to rule sets or help content.

Mitigation:

- rule sets versioned by `case_type + tax_year`,
- requirement templates scoped by active year range,
- help content includes explicit tax-year references.

### R-05 Hardcoded origin-country logic

Severity: High

Current state:

- no operational country-of-origin rule usage,
- business requirement explicitly forbids Spain hardcoding.

Mitigation:

- store origin-country as case fact,
- derive certificate requirement from residency pattern, not country name,
- keep help content generic with country token substitution where needed.

### R-06 Sensitive business logic exposed only in frontend

Severity: High

Current state:

- wizard normalization and checklist-like derivation occur client-side,
- case data can be partially updated directly from browser.

Mitigation:

- backend validates intake and computes derived facts,
- backend generates requirements,
- frontend becomes a rendering/input layer, not final rule authority.

### R-07 PII concentration inside generic JSON blobs

Severity: Medium

Current state:

- `cases.wizard_data` stores broad intake content without schema versioning.

Mitigation:

- versioned `case_intake_snapshots`,
- explicit top-level case summary fields,
- normalized derived facts contract.

### R-08 Misleading client progress

Severity: Medium

Current state:

- progress uses checklist/fallback heuristics,
- uploads can disappear after refresh,
- activity timeline is static text.

Mitigation:

- compute progress from requirement/document statuses,
- replace fake timeline with `case_events`,
- never count non-persisted uploads.

### R-09 Weak internal review tooling

Severity: Medium

Current state:

- admin can change case status and notes,
- but cannot review documents/requirements in a structured way.

Mitigation:

- admin summary endpoint,
- requirement/document review actions,
- explicit rejection reasons and waiver reasons,
- event emission on all review actions.

### R-10 Storage retention mismatch

Severity: Medium

Current state:

- retention policy table exists,
- documents retention note is still `365` days as MVP baseline.

Mitigation:

- review document retention policy as part of implementation,
- define retention by document category and legal basis,
- make deletion/archive behavior explicit in ops runbook.

### R-11 Missing checksum/replace semantics

Severity: Medium

Current state:

- document rows have no checksum or replacement lineage.

Mitigation:

- add checksum and `replaced_by_document_id`,
- keep review history through events.

### R-12 Translation drift in requirement content

Severity: Low

Current state:

- generic UI translations exist, but requirement-specific help is not modeled.

Mitigation:

- version requirement help content separately from generic UI messages,
- treat help content as structured business content with explicit translation coverage.
