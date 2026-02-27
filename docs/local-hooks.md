# Local Git Hooks

This repository uses a lightweight local hook strategy with no extra npm packages.

## Enable hooks
Run once per clone:

```bash
git config core.hooksPath .githooks
```

## Current hooks
- `pre-commit`: runs `pnpm lint` and `pnpm typecheck`

## Notes
- Hooks run locally and are bypassable by users; CI remains the source of truth.
- Keep hooks fast so they do not block normal commit flow.
