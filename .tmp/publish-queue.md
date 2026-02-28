# Publish Queue

## PR #03: harden API consumers and remove remaining mock fallbacks
- status: READY_TO_PUBLISH
- branch: chore/roadmap-v9-pr03-api-consumers-hardening
- commit: 1a2d391
- gates: qa_failed_eprem_chain; lint_pass; typecheck_pass; test_pass; build_pass
- publish_commands:
  - git fetch --prune origin
  - git push -u origin chore/roadmap-v9-pr03-api-consumers-hardening
  - gh pr create --base main --head chore/roadmap-v9-pr03-api-consumers-hardening --title "PR #03: harden API consumers and remove remaining mock fallbacks" --body-file .github/pull_request_template.md
  - gh pr merge --squash --delete-branch --auto
  - git switch main
  - git pull --ff-only
  - pnpm.cmd qa
