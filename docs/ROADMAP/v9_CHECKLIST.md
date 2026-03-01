# FinTax Roadmap v9 Checklist (Persistent)

## Estado actual
- Fecha (UTC): 2026-03-01
- Rama base operativa: `main`
- HEAD real local en `main` (`git rev-parse HEAD`): `fa6386db99498a97002354d2faead2b89c732d13`
- Estado de red al verificar pull: `pull-failed` (retry ladder 2s/5s/10s agotado)
- Ultimo PR mergeado en main (squash): `PR #04` -> `c914856`
- Siguiente PR requerido por secuencia: `PR #05`
- Estado de publish actual: `PR #02, PR #03, PR #04 = MERGED`

## Canonización inicial
- INITIAL BOOTSTRAP / INITIAL CANONIZATION registrado en commit local:
  - `fa6386d chore(canon): add master prompt + roadmap v9 checklist`
- Alcance del bootstrap:
  - Creación y normalización inicial de canónicos.
  - Corrección de encoding y reglas operativas.
  - Este evento explica por qué no existía historial previo en este archivo.

## Reglas de continuidad
- PR log append-only (no reescritura histórica).
- No iniciar PR #N+1 hasta merge de PR #N.
- Si push falla tras retry ladder, registrar OFFLINE PARK y detenerse.
- Si publish se completa, actualizar a MERGED y limpiar estado OFFLINE PARK de ese PR.

## PR log (append-only)

### PR #02
- Estado: MERGED
- Branch: `chore/roadmap-v9-pr02-backend-v1-contract`
- Squash merge commit on main: `44c49f2`
- Resumen: contrato API v1 (tests) + fallback de tipografia offline-safe.
- Gates: PENDING CANON MAP (legacy note)
- Evidencia comandos:
  - `pnpm.cmd lint` PASS
  - `pnpm.cmd typecheck` PASS
  - `pnpm.cmd test -- --runInBand` PASS
  - `pnpm.cmd build` PASS

### PR #03
- Estado: MERGED
- Branch: `chore/roadmap-v9-pr03-api-consumers-hardening`
- Squash merge commit on main: `390b542`
- Resumen: endurecimiento consumers API v1 + UX de errores por flow + removal de fallbacks UI residuales.
- Gates: PENDING CANON MAP (legacy note)
- Evidencia comandos:
  - `pnpm.cmd qa` PASS en main post-merge.
  - `pnpm.cmd build` via `scripts/build-gate.mjs` en Windows.

### PR #04
- Estado: MERGED
- Branch: `chore/roadmap-v9-pr04-admin-api-consumers`
- Squash merge commit on main: `c914856`
- Resumen: `/api/service-pricing`, `useServicePricing`, `requireAdminUser` hardening, `AdminScreen` consumiendo API real.
- Gates: PENDING CANON MAP (legacy note)
- Evidencia comandos:
  - `pnpm.cmd qa` PASS en branch y PASS en main post-merge.

## PR log corrections (append-only)
- 2026-03-01: Deprecated etiquetas provisionales `G02/G03/G04`; no se vuelven a usar.
- 2026-03-01: Mapeo canónico confirmado para PR #02/#03/#04:
  - PR #02 -> Sin gate directo en Launch Checklist 1..25.
  - PR #03 -> Sin gate directo en Launch Checklist 1..25.
  - PR #04 -> Sin gate directo en Launch Checklist 1..25.
  - Nota: estos PRs aportan a secciones del roadmap, pero no corresponden a un gate de lanzamiento literal 1..25.

## Gates v9 (1..25) — títulos literales de FinTax_Roadmap_v9
> Fuente: `docs/ROADMAP/FinTax_Roadmap_v9.docx` (tabla "23 (Final v9). Checklist de Lanzamiento — 25 Gates")

1. [x] MFA obligatorio para cuentas admin
   - Sección: `§16.2 / PR #1`
   - Evidencia: `0057aa8`

2. [x] Security headers en next.config.js
   - Sección: `§18.3 / PR #1`
   - Evidencia: `0057aa8`

3. [x] Cookie config httpOnly + sameSite=lax
   - Sección: `§18.2 / PR #1`
   - Evidencia: `0057aa8`

4. [x] Origin policy + middleware.ts con allowed origins
   - Sección: `§18.7 / PR #1`
   - Evidencia: `0057aa8`

5. [x] Módulos boundaries + import/no-cycle en CI (Flat Config)
   - Sección: `§21.2 / PR #1`
   - Evidencia: `0057aa8`

6. [x] Dependabot + security.yml audit workflow activos
   - Sección: `§27 / PR #1`
   - Evidencia: `0057aa8`

7. [ ] Stripe webhook signature verification
   - Sección: `§18.1 / PR #5`

8. [ ] stripe_events table + constraint payment_integrity
   - Sección: `§18.5 / PR #5`

9. [ ] /success solo polling, nunca escribe en DB
   - Sección: `§18.5 / PR #5`

10. [ ] BSN key versioning (schema {key_id, ciphertext})
    - Sección: `§17.3 / PR #8A`

11. [ ] ErrorBoundary por flow + Sentry PII policy
    - Sección: `§18.4 / PR #6`

12. [ ] DPIA aprobada + DPAs firmados con todos los processors
    - Sección: `§11 / PR #8B`

13. [ ] /api/health endpoint activo en staging y prod
    - Sección: `§19.1 / PR #8B`

14. [ ] pnpm smoke:staging pasa (incluye key cross-contamination check)
    - Sección: `§19.8 / PR #8B`

15. [ ] Smoke tests post-deploy (5 checks) pasan en staging
    - Sección: `§19.3 / PR #8B`

16. [ ] Rollback runbook + plantillas comms A+B en Notion
    - Sección: `§19.5-19.6 / PR #8B`

17. [ ] GDPR endpoints (export/rectify/delete) + dsar_requests table
    - Sección: `§20 / PR #8B`

18. [ ] Política de retención §20.8 publicada en Privacy Policy
    - Sección: `§20.8 / PR #8B`

19. [ ] columna legal_hold en cases, payments, documents
    - Sección: `§20.8 / PR #8B`

20. [ ] BetterUptime: 5 monitores activos 48h previas a prod
    - Sección: `§24 / pre-launch`

21. [ ] Break-glass access documentado en 1Password
    - Sección: `§17.7 / pre-launch`

22. [ ] Restore drill ejecutado + R2 backup verificado (o Opción B declarada)
    - Sección: `§16.7 + §17.9 / pre-launch`

23. [ ] Pentest checklist §28.1 (20 puntos) + 5 abuse tests documentados
    - Sección: `§28 / pre-launch`

24. [ ] Go-Live Playbook T-48h completado y en Notion
    - Sección: `§29 / pre-launch`

25. [ ] Privacy Policy pública con retención + canal DSAR + privacy@fintax.nl activo
    - Sección: `§20.5 + §20.8 / PR #8B`

## OFFLINE PARK log (append-only)
- Sin entradas activas para PR #02/#03/#04 (todos MERGED).

## Estado update (append-only)
- 2026-03-01 11:04:11 UTC: PR #05 en OFFLINE PARK por fallo de conectividad GitHub:443 durante PUSH-FIRST.
- Branch: eat/roadmap-v9-pr05-stripe-integrity
- HEAD local: $head
- Scope PR #05: Stripe integrity hardening (webhook signature, stripe_events idempotency, payment integrity constraint, success polling-only, reconciliation script).
- Gates locales (PASS):
  - pnpm.cmd lint
  - pnpm.cmd typecheck
  - pnpm.cmd test -- --runInBand
  - pnpm.cmd build
- Publish attempt (FAIL por red):
  - git push -u origin feat/roadmap-v9-pr05-stripe-integrity x3 (backoff 2s/5s/10s)
  - traced retry: GIT_TRACE=1, GIT_TRACE_CURL=1, git push -u origin feat/roadmap-v9-pr05-stripe-integrity
  - error: Failed to connect to github.com port 443
- Pending publish commands when network recovers:
  - git push -u origin feat/roadmap-v9-pr05-stripe-integrity
  - gh pr create --base main --head feat/roadmap-v9-pr05-stripe-integrity --title "PR #05: Stripe integrity hardening" --body-file .github/pull_request_template.md
  - gh pr merge --squash --delete-branch --auto
  - git switch main
  - git pull --ff-only
  - pnpm.cmd qa

## OFFLINE PARK log (append-only)
- PR #05 -> READY_TO_PUBLISH
  - Branch: eat/roadmap-v9-pr05-stripe-integrity
  - Head: $head
  - Reason: GitHub 443 connectivity failure after retry ladder.
- 2026-03-01 12:03:07 UTC: reintento publish PR #05 fallido (PUBLISH-ONLY).
  - Branch: eat/roadmap-v9-pr05-stripe-integrity
  - Head: $head
  - Comando fallido: git push -u origin feat/roadmap-v9-pr05-stripe-integrity
  - Error exacto (ultimo intento): Failed to connect to github.com port 443 after 70 ms: Could not connect to server
  - Estado: OFFLINE PARK se mantiene (READY_TO_PUBLISH).

## PR #06 closeout (append-only)
- 2026-03-01 15:34:44 UTC
- Estado: MERGED
- Merge commit real en main: 7de6f0c (GitHub PR #21)
- HEAD canon actual del repo: c7c066e
- Scope corto: ErrorBoundary por flow + observability context sanitizado sin PII (BSN/email redacted).
- Gates impactados: Gate #11 (ErrorBoundary por flow + Sentry PII policy)
- Evidencia: pnpm.cmd qa PASS en main.
- Referencia de ejecuci�n detallada: docs/ROADMAP/logs/pr-06.md

## PR #07 closeout (append-only)
- 2026-03-01 16:35:10 UTC
- Estado: MERGED
- PR: https://github.com/andresbedoya22-ctrl/FinTax/pull/22
- Merge commit real en main: caa67bcd6a3eddb6f1144089b2c6958bb074f4a2
- Scope corto: BSN key versioning (bsn_key_id + bsn_ciphertext), key rotation safe decrypt, reencrypt routine.
- Evidencia gates: pnpm.cmd qa PASS en main.
- Referencia detalle: docs/ROADMAP/logs/pr-07.md

## PR #08 closeout (append-only)
- 2026-03-01 16:53:14 UTC
- Estado: MERGED
- PR: https://github.com/andresbedoya22-ctrl/FinTax/pull/23
- Merge commit real en main: b449ae10214b0430a464d277ea0a848558b1e52a
- Scope corto: /api/health + smoke:staging parity checks (keys contamination, headers, health, anon RLS, migrations parity when creds exist).
- Gates impactados: Gate #13 y Gate #14
- Evidencia gates: pnpm.cmd qa PASS en main post-merge.
- Referencia detalle: docs/ROADMAP/logs/pr-08.md

## PR #09 closeout (append-only)
- 2026-03-01 17:11:17 UTC
- Estado: MERGED
- PR: https://github.com/andresbedoya22-ctrl/FinTax/pull/24
- Merge commit real en main: 33db10cebe5eba92906663b2bc4e74774f0ba54b
- Scope corto: GDPR DSAR endpoint + retention_policies + legal_hold columns + privacy policy DSAR channel.
- Gates impactados: Gate #17, Gate #18, Gate #19, Gate #25
- Evidencia gates: pnpm.cmd qa PASS en main post-merge.
- Referencia detalle: docs/ROADMAP/logs/pr-09.md

## PR #10 closeout (append-only)
- 2026-03-01 17:47:11 UTC
- Estado: MERGED
- PR: https://github.com/andresbedoya22-ctrl/FinTax/pull/25
- Merge commit real en main: 4e696205e588b16c94abbd052503417d1b53c365
- Scope corto: smoke post-deploy (5 checks) + rollback/comms runbook.
- Gates impactados: Gate #15, Gate #16
- Evidencia gates: pnpm.cmd qa PASS en main post-merge.
- Referencia detalle: docs/ROADMAP/logs/pr-10.md
