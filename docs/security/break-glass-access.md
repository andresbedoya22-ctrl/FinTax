# Break-Glass Access Procedure

## Purpose
Define emergency access for critical systems when primary auth paths are unavailable.

## Storage location
- 1Password vault item: `FinTax / Break-Glass Access`
- Owners: Security lead + Engineering lead
- Access policy: dual control (two approvers)

## Contents required in vault item
- Emergency admin account identifiers
- Recovery codes (MFA backup)
- Hosting provider emergency access path
- Supabase emergency admin procedure
- Stripe dashboard emergency access procedure

## Activation criteria
- Production outage with blocked normal admin login
- Security incident requiring immediate account lockout or rollback
- Identity provider outage blocking standard access

## Activation steps
1. Open incident and assign incident commander.
2. Document activation reason and timestamp.
3. Obtain second approver confirmation.
4. Retrieve break-glass credentials from 1Password.
5. Execute minimum required action only.
6. Rotate all used secrets/credentials immediately after incident.
7. Close incident with audit trail.

## Audit trail requirements
- Who accessed break-glass item
- Why it was used
- Systems touched
- Actions performed
- Rotation confirmation
