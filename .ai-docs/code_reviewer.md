# Code Review Standards — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

## Run this checklist before committing any change

---

### Functionality
- [ ] Does the change do what the task/ticket describes?
- [ ] Are edge cases handled? (empty Sheets response, API timeout, malformed external data)
- [ ] Is error handling in place — try/catch on all external calls?
- [ ] Are loading and empty states handled in the UI?
- [ ] Does Run Daily still complete end-to-end after the change?

---

### Code quality
- [ ] No duplicated logic — DRY
- [ ] Functions do one thing
- [ ] Naming is clear and descriptive — no abbreviations or single-letter variables
- [ ] No magic numbers — use named constants
- [ ] No dead code, commented-out blocks, or TODO comments in committed code
- [ ] No `console.log` statements left in production code (use the logger)

---

### Security (localhost context)
- [ ] No API keys, tokens, or credentials hardcoded — `.env` only
- [ ] All user inputs from the Settings screen are validated and sanitised before use
- [ ] Raw external API errors are not sent to the frontend
- [ ] New code does not bind the server to `0.0.0.0` or open new network listeners
- [ ] No new packages added without `pnpm audit` check

---

### Performance
- [ ] No unnecessary React re-renders — use `useMemo` / `useCallback` where appropriate
- [ ] No N+1 patterns against Google Sheets (batch reads, not row-by-row)
- [ ] Async operations during Run Daily show live progress feedback — no silent waits
- [ ] No blocking synchronous calls in Express route handlers

---

### Data integrity
- [ ] All Sheets writes are append-only — no deletes or overwrites
- [ ] External API response validated before being written to Sheets
- [ ] Field lengths within limits (5000 chars scripts, 500 chars titles)
- [ ] Drive creates a new document per script — does not overwrite

---

### Tests
- [ ] New service module code has unit tests
- [ ] Existing tests still pass: `pnpm test`
- [ ] Happy path + at least one failure path tested for any new API service call
- [ ] No real paid API calls in any test (all mocked)

---

## Review language
- Prefix comments with: `suggestion:`, `nit:`, `blocker:`
- Blockers must be resolved before merging
- Nits are optional improvements
- Never personal — always about the code
