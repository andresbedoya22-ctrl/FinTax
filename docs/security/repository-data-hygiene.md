## Repository Data Hygiene

- `src/lib/mock-data.ts` now contains only fictitious placeholder identities.
- Because prior revisions included real personal data in mocks, repository history should be reviewed separately and cleaned through a dedicated maintenance/security branch if exposure scope requires it.
- This change does not rewrite git history from the current feature branch.
