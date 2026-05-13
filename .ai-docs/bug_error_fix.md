# Bug & Error Fix Protocol — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

---

## Step 1: Reproduce first
NEVER write a fix before you can reproduce the bug.
- Get the exact steps to reproduce (e.g. "click Run Daily → step 2 hangs")
- Note the environment: localhost dev (`pnpm dev`)
- Check browser console AND server terminal output
- Check `./logs/app.log` for server-side errors

---

## Step 2: Isolate
- Is it frontend (React) or backend (Express)?
- Is it a data problem (bad Google Sheets response shape) or logic problem?
- Is it an external API failure (Anthropic, OpenAI, YouTube, Tavily, GitHub, Sheets, Drive)?
- Is it intermittent (network flake) or consistent (code bug)?
- Check `./logs/app.log` first — never debug blind

---

## Step 3: Understand root cause
- Never patch symptoms — fix the root cause
- If root cause is unclear, STOP and ask before guessing
- For external API failures: check if the service is down before assuming a code bug

---

## Step 4: Fix
- Keep the fix minimal — do not refactor while fixing
- Add a brief comment only if the fix is non-obvious: `// Fix: [brief explanation]`
- Do NOT push to git until fix is confirmed working

---

## Step 5: Test
- Reproduce the original bug → confirm it's gone
- Run the affected flow end-to-end (e.g. full Run Daily if pipeline was affected)
- Run `pnpm test` to confirm nothing else broke
- Add a regression test for this bug if a service module was changed

---

## Step 6: Document
- Note the bug and fix in the git commit message
- Format: `fix: [what was broken] — [why it happened]`

---

## Common error patterns — ORBIT Dashboard

| Error pattern | First thing to check |
|---|---|
| Run Daily hangs / never completes | Check server terminal — which step logged last. Check API service module for missing await or uncaught promise. |
| Google Sheets write fails | Validate response shape from prior step. Check that GOOGLE_SHEETS_ID in `.env` is correct. |
| Google Drive file not created | Check GOOGLE_DRIVE_FOLDER_ID. Check Drive OAuth token hasn't expired. |
| Anthropic / OpenAI timeout | Check API key in `.env`. Check spend cap — session may have hit $10 limit. |
| YouTube channel not found | Validate channel ID format. Check YOUTUBE_API_KEY quota. |
| Tavily returns empty results | Tavily may be down — check status page. Retry with a different query. |
| Reddit fetch returns 429 | Reddit rate-limited the public JSON endpoint. Wait 60s and retry. |
| Settings screen shows Disconnected | The service key in `.env` is missing or malformed. |

---

## Escalation
If a bug can't be isolated in 1 hour → stop, document what was tried, and ask Shuv.
Never deploy a speculative fix to cover up an unknown root cause.
