# Security Implementation — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

## Context
ORBIT Dashboard is a single-user localhost app. There is no login, no authentication, and no public internet exposure. Security focus is on protecting API keys, validating data inputs, and preventing accidental data loss — not on user auth or multi-tenant isolation.

---

## Secrets management
- All API keys stored in `.env` — never hardcoded in source files
- `.env` must be in `.gitignore` — never committed to version control
- Required keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `YOUTUBE_API_KEY`, `TAVILY_API_KEY`, `GITHUB_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_SHEETS_ID`, `GOOGLE_DRIVE_FOLDER_ID`
- Never log secrets — mask keys in the Settings screen (show first 4 chars + `****`)
- Rotate keys if any are accidentally exposed
- Use `.env.example` with placeholder values to document required keys

---

## Input validation
- Validate ALL external API responses before writing to Google Sheets — never assume shape
- Sanitise any user-entered text (competitor channel URL/ID in Settings) before passing to YouTube API
- Validate YouTube channel URLs/IDs: must match known format before API call
- Limit all string fields written to Sheets — truncate at 5000 chars for script fields, 500 chars for titles
- Never pass raw external API output directly into AI prompts without sanitisation

---

## API call safety
- All external API calls go through dedicated service modules in `/src/services/` — never inline in routes or components
- Wrap every external call in try/catch — log errors, surface user-friendly message in UI
- Never expose raw API error details (including status codes, keys, or URLs) to the frontend
- Daily run must respect the $10 per session AI spend cap — estimate token counts before large batch calls

---

## Google Sheets / Drive safety
- Never delete rows — append only (soft history)
- Before any write to Sheets, validate that the target tab and column range exist
- Drive documents are created, never overwritten — each approved idea creates a new file
- Google OAuth credentials stored in `.env` — refresh tokens handled server-side only

---

## localhost-specific rules
- App must only bind to `127.0.0.1` — never `0.0.0.0`
- Never expose the app to a public IP or port-forward it
- No HTTPS required for localhost; do not add self-signed cert complexity
- CORS not applicable — all requests are same-origin (React dev server proxied through Express)

---

## Dependencies
- Run `pnpm audit` before any new dependency is added
- Review new packages for known CVEs before installing
- Keep dependencies updated — check monthly

---

## Error handling
- All errors caught and logged to `./logs/app.log` with timestamp
- Never silently swallow errors — always log and surface in UI
- Never expose stack traces to the frontend — show generic "something went wrong" + log ref
