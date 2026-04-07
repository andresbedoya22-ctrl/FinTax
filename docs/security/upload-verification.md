## Upload Finalize Verification

- `finalize` now verifies the stored object with `storage.from(bucket).info(path)` plus a server-side download before creating the document row.
- Enforced checks:
  - object exists in Supabase Storage at the issued path
  - stored byte length matches the issued session size
  - server-computed SHA-256 matches the client-supplied checksum when present
  - allowed MIME is re-evaluated against storage metadata and server-side signature sniffing
- Strong server-side signature detection currently covers:
  - `application/pdf`
  - `image/png`
  - `image/jpeg`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `text/csv` via text-content heuristic plus `.csv` filename
- Limitation:
  - Supabase Storage `contentType` is still object metadata supplied at upload time, so it is not treated as authoritative on its own.
  - For future MIME types without a deterministic signature detector, verification must be extended explicitly before those types can be treated as strongly verified.
