# Security Review — Pre-Run Checklist — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

## Context
ORBIT Dashboard is a single-user, localhost-only app. There is no login, no cloud deployment, no public internet exposure. This checklist focuses on what is actually relevant: API key safety, data integrity, and dependency health.

---

## Run this checklist before any major change or new dependency

### Secrets & API keys
- [ ] All keys are in `.env` — not hardcoded anywhere in source
- [ ] `.env` is listed in `.gitignore` — confirm before any `git add`
- [ ] `.env.example` exists and documents all required keys with placeholder values
- [ ] Settings screen masks keys: first 4 chars + `••••` + last 4 chars only
- [ ] No API key appears in any log file or console output

### Required keys present in `.env`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `YOUTUBE_API_KEY`
- [ ] `TAVILY_API_KEY`
- [ ] `GITHUB_TOKEN`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_SHEETS_ID`
- [ ] `GOOGLE_DRIVE_FOLDER_ID`

### Input validation
- [ ] Competitor YouTube channel URL/ID validated against known format before API call
- [ ] All external API responses validated before writing to Google Sheets
- [ ] All string fields truncated before Sheets writes (5000 chars for scripts, 500 for titles)

### API call safety
- [ ] Every external API call is wrapped in try/catch
- [ ] Raw API error details (status codes, URLs, keys) are never sent to the frontend
- [ ] AI spend estimate checked before large batch calls — abort if over $10 session cap

### Google Sheets / Drive
- [ ] No rows deleted — append-only confirmed
- [ ] Target tab and column range validated before any write
- [ ] Drive documents created fresh per idea — never overwritten

### Network binding
- [ ] Express server binds to `127.0.0.1` — not `0.0.0.0`
- [ ] No port-forwarding or public exposure configured

### Dependencies
- [ ] `pnpm audit` run — no critical vulnerabilities
- [ ] No new packages added without review

---

## Sign-off
Reviewed by: Shuv Gangopadhyay — OrbitumAI
Date: ___________
Approved: [ ] YES  [ ] NO
