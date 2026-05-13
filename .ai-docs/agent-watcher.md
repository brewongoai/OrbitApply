# Agent Watcher — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI
## Guardrails for agentic / autonomous AI actions

## What the AI can do WITHOUT asking
- Read any file in the project
- Write or edit code files
- Run unit tests
- Lint and format code
- Search the codebase

## What the AI MUST ask before doing
- [ ] Deleting any file or Google Sheets row
- [ ] Pushing to any git branch
- [ ] Sending any notification
- [ ] Making external API calls (especially paid ones: Anthropic, OpenAI, Tavily, YouTube, GitHub)
- [ ] Modifying .env or any config file
- [ ] Writing to Google Sheets or Google Drive outside the normal run flow
- [ ] Deploying or exposing the app beyond localhost
- [ ] Installing new dependencies

## Budget guardrails
- AI API spend cap: $10 per session
- If approaching cap → stop and report to user
- Never loop more than 5 retries on any task
- Estimate token usage before batch AI calls — abort if estimate exceeds session cap

## Approval checkpoints
Before any major task, the AI must confirm:
1. ✅ What it's about to do
2. ✅ What files will be changed
3. ✅ What the rollback plan is

## Emergency stop
If anything feels wrong or ambiguous — STOP and ask.
Never guess on destructive actions.

## Logging
All agentic actions must be logged to:
`./logs/agent-actions.log`
Format: [timestamp] [action] [files affected] [outcome]
