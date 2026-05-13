# Compliance Builder — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI
## Rules to follow WHILE building features

## Context
ORBIT Dashboard is a single-user, localhost-only tool. There is no authentication, no user accounts, no PII, no cloud deployment. Rules here cover API key safety, data integrity, AI spend control, and keeping the app strictly local.

---

## Secrets & API keys
- All API keys live in `.env` — never hardcoded in any source file
- Never log any key, token, or credential to console or log files
- Keys displayed in the Settings screen must be masked: first 4 chars + `••••` + last 4 chars
- Rotate a key immediately if it is accidentally exposed (e.g. console.log, git commit)

---

## External API calls
- All external API calls must live in dedicated service modules under `/src/services/`
- Never call external APIs directly from route handlers or React components
- Every external call must be wrapped in try/catch with a user-friendly error surfaced to the UI
- Never expose raw API error messages, status codes, or URLs to the frontend
- Estimate token cost before any batch Anthropic or OpenAI call — abort if it would exceed $10 session cap

---

## Google Sheets data handling
- Sheets is the sole database — treat it with care
- **Append only** — never delete or overwrite existing rows
- Validate that the target tab and column range exist before any write
- Validate and sanitise all data before writing — never write raw external API output directly
- Truncate all fields to size limits: 5000 chars for script fields, 500 chars for title fields

---

## Google Drive
- Each approved idea creates a new Drive document — never overwrite an existing one
- Drive folder ID must come from `.env` — never hardcoded
- OAuth refresh tokens handled server-side only — never sent to the frontend

---

## Network binding
- Express server must bind to `127.0.0.1` — never `0.0.0.0`
- Never add port-forwarding, ngrok, or any mechanism that exposes the app beyond localhost
- All API routes are `/api/v1/` — localhost-to-localhost only

---

## Input validation
- Validate YouTube channel URLs/IDs against known format before passing to the API
- Sanitise all user-entered text (Settings screen inputs) before any API or Sheets call
- Reject malformed competitor channel IDs before they reach any external call

---

## Dependencies
- Run `pnpm audit` before adding any new package
- Review new packages for telemetry, data collection, or known CVEs before installing
- Do not add a package unless it is specifically needed for a feature being built

---

## Build-time compliance checklist
- [ ] No API keys hardcoded anywhere
- [ ] `.env` not committed to git
- [ ] All external calls go through `/src/services/` modules
- [ ] All error messages shown in UI are generic — no system internals exposed
- [ ] All Sheets writes are append-only
- [ ] Server binds to 127.0.0.1
