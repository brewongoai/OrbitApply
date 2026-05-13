# Test Writing Standards — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

## What must be tested
- All utility functions (unit tests)
- All API route handlers (integration tests)
- Critical user flows: Run Daily pipeline, competitor add/remove, script generation trigger
- All error and failure states (API timeout, Sheets write failure, Drive upload failure)
- All external API service modules in `/src/services/`

## What does NOT need tests
- Third-party library internals
- Simple config files
- Pure UI styling (test behaviour, not appearance)
- Reddit public JSON fetch (unofficial endpoint — mock it)

---

## Test naming convention
```js
describe('[component/function name]', () => {
  it('should [expected behaviour] when [condition]', () => {})
})
```

---

## Coverage minimums
| Area | Target |
|---|---|
| Utility functions | 90%+ |
| API route handlers | 80%+ |
| Service modules (`/src/services/`) | 80%+ |
| UI components | 60%+ |
| Overall | 70%+ |

---

## Test structure — AAA pattern
```js
// Arrange — set up inputs and mocks
// Act — call the function / render the component
// Assert — check the outcome
```

---

## Mocking rules
- **Always mock external APIs** — never call real paid APIs in tests (Anthropic, OpenAI, YouTube, Tavily, GitHub, Google Sheets, Google Drive)
- Mock at the service module level — not at the HTTP level
- Never mock the thing you're testing
- Use realistic mock response shapes — not stub strings like "test"

---

## Test data
- Use fixtures or factory functions — never hardcode test data inline
- Always test with both valid AND invalid inputs
- For Google Sheets mocks: use realistic row shapes matching the actual tab schemas

---

## Running tests
```bash
pnpm test              # unit tests
pnpm run test:e2e      # end-to-end
pnpm run coverage      # full coverage report
```

---

## AI spend safety in tests
- All Anthropic and OpenAI calls must be mocked — no real tokens consumed during test runs
- If a test accidentally hits a live API, it is a failing test by definition
