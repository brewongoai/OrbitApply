# Compliance Reviewer — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI
## Checklist to run AFTER building a feature, before committing

## Context
ORBIT Dashboard is a single-user, localhost-only tool. There is no cloud, no user accounts, no PII, no public internet exposure. Compliance here means: data integrity, API key safety, spend control, and keeping the app from accidentally reaching beyond localhost.

---

## Secrets audit
- [ ] No API keys, tokens, or credentials hardcoded anywhere in source files
- [ ] `.env` is in `.gitignore` — will NOT be committed
- [ ] `.env.example` is up to date with all required keys (placeholder values only)
- [ ] Settings screen shows masked keys only (first 4 + `••••` + last 4)

---

## Data integrity audit
- [ ] All Google Sheets writes are append-only — no rows deleted or overwritten
- [ ] All external API responses validated before writing to Sheets
- [ ] All string fields truncated to size limits before write (5000 chars scripts, 500 chars titles)
- [ ] Google Drive documents created fresh per script — never overwritten
- [ ] No data written to Sheets outside of the normal daily run flow without explicit user action

---

## API spend audit
- [ ] AI spend estimate checked for any new batch Claude or OpenAI call
- [ ] Session cap of $10 enforced — abort and report if exceeded
- [ ] No real paid API calls made during test runs (all mocked)

---

## Network / exposure audit
- [ ] Express server binds to `127.0.0.1` only — not `0.0.0.0`
- [ ] No new routes added that accept external traffic
- [ ] No webhooks, callbacks, or external listeners added
- [ ] No ngrok, localtunnel, or similar tunnelling configured

---

## Dependency audit
- [ ] `pnpm audit` run after any new package install — no critical vulnerabilities
- [ ] New packages reviewed for known data collection or telemetry
- [ ] No packages that phone home with usage data

---

## Logging audit
- [ ] `./logs/app.log` logs errors with timestamps — not silently swallowing them
- [ ] No API keys, tokens, or raw external error responses appear in any log
- [ ] No stack traces sent to the frontend — generic error message only

---

## Sign-off
Reviewed by: Shuv Gangopadhyay — OrbitumAI
Date: ___________
Approved: [ ] YES  [ ] NO
