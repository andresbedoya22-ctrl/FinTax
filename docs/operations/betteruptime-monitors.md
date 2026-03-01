# BetterUptime Monitors (48h Pre-Prod Window)

## Objective
Activate and verify 5 monitors at least 48 hours before production launch.

## Required monitors
1. **Web root availability**
   - URL: `https://fintax.nl/`
   - Method: `GET`
   - Expectation: `2xx/3xx`
   - Interval: 60s
2. **Health endpoint**
   - URL: `https://fintax.nl/api/health`
   - Method: `GET`
   - Expectation: `200` and JSON envelope with `data.status = "ok"`
   - Interval: 60s
3. **Auth callback health**
   - URL: `https://fintax.nl/en/auth/callback`
   - Method: `GET`
   - Expectation: non-`5xx` (redirect allowed)
   - Interval: 60s
4. **Stripe webhook endpoint reachability**
   - URL: `https://fintax.nl/api/stripe/webhook`
   - Method: `POST`
   - Expectation: non-`5xx` (signature validation may reject request)
   - Interval: 120s
5. **Staging smoke monitor**
   - URL: staging smoke pipeline job status endpoint
   - Expectation: last run PASS
   - Interval: 300s

## Alert routing
- Primary channel: incident Slack / Teams channel.
- Secondary: on-call email list.
- Escalation: page on-call engineer if monitor stays red for 5 minutes.

## Verification evidence
- Keep screenshots/links for all 5 monitors.
- Record first-green timestamp and 48h continuous uptime window in launch notes.
