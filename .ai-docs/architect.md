# Architecture Decisions — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

## Stack overview
- **Frontend:** React (localhost web app)
- **Backend:** Node.js (local Express server)
- **Database:** Google Sheets (user-owned, 4 tabs: Competitors, Research, Video Ideas, Scripts)
- **File storage:** Google Drive (generated script documents)
- **Hosting:** localhost only — no cloud deployment, no Vercel
- **AI — Writing:** Anthropic Claude (all analysis, briefing, ideas, scripts)
- **AI — Enrichment:** OpenAI (scoring, ranking, data extraction, summarisation)

---

## Architecture Decision Records (ADRs)

### ADR-001: Database — Google Sheets over Supabase / PostgreSQL
- **Date:** 2026-05-11
- **Decision:** Use Google Sheets as the sole database
- **Alternatives considered:** Supabase, SQLite, local JSON files
- **Reason:** The user already owns and understands Google Sheets. No new database to learn or maintain. History is searchable and copyable by the user directly. No server infrastructure required. Sufficient for single-user, ~365 rows/year per tab.
- **Consequences:** No complex queries. No relational joins. Data model must stay flat and tab-based. Schema changes require Sheets column updates.

### ADR-002: Hosting — localhost only
- **Date:** 2026-05-11
- **Decision:** App runs on localhost — no internet-facing server
- **Alternatives considered:** Vercel, Railway, self-hosted VPS
- **Reason:** Single user. No need for cloud availability. Keeps all API keys and data local. Eliminates hosting costs and attack surface. "Open browser and press Run" is the entire deployment story.
- **Consequences:** App only works when the user's machine is on. No mobile access. Setup on a new machine requires env config (~30 minutes).

### ADR-003: Authentication — none
- **Date:** 2026-05-11
- **Decision:** No authentication, no login, no sessions
- **Alternatives considered:** Simple password, Supabase Auth, OAuth
- **Reason:** Single user running on localhost. Auth adds complexity with zero security benefit in this context. The only "auth" is physical access to the machine.
- **Consequences:** Never expose this app to the public internet. No multi-user support possible without rearchitecting.

### ADR-004: AI provider split — Anthropic + OpenAI
- **Date:** 2026-05-11
- **Decision:** Anthropic Claude handles all writing; OpenAI handles scoring and data enrichment. Both are active — OpenAI is not a fallback.
- **Alternatives considered:** Anthropic only, OpenAI only
- **Reason:** Claude produces higher quality long-form narrative and scripts. OpenAI is faster and cheaper for structured scoring tasks. Splitting by role gets best output at lowest cost.
- **Consequences:** Two API keys required. Two billing accounts to monitor. Each provider has a defined role — do not swap tasks between them.

### ADR-005: Script delivery — Google Drive
- **Date:** 2026-05-11
- **Decision:** Generated scripts are saved as Google Drive documents and opened on the user's phone
- **Alternatives considered:** Email, Notion, local file download
- **Reason:** User's phone already has Google Drive. No friction to view scripts before recording. Drive link opens instantly. No email setup or copy-paste required.
- **Consequences:** Requires Google Drive API credentials. Drive files accumulate over time (no auto-archive in v1).

### ADR-006: Competitor channel management — UI over .env
- **Date:** 2026-05-11
- **Decision:** Competitor YouTube channels managed from the Settings screen, stored in Google Sheets
- **Alternatives considered:** Hardcoded in .env, hardcoded in config file
- **Reason:** User is non-technical. Editing code files or .env to change competitors is a hard stop. Settings screen + Google Sheets means changes take effect next run with zero code involvement.
- **Consequences:** Competitor list must be read from Sheets at the start of each daily run, not from config.

---

## Data model — Google Sheets tabs

### Tab 1: Competitors
| Column | Description |
|---|---|
| channel_id | YouTube channel ID |
| channel_name | Display name |
| video_id | Latest video ID |
| video_title | Latest video title |
| published_at | ISO timestamp |
| run_date | Date of this data fetch |

### Tab 2: Research
| Column | Description |
|---|---|
| run_date | Date |
| source | tavily / reddit / github |
| title | Article or repo title |
| url | Source URL |
| summary | OpenAI-generated summary |
| relevance_score | 1-10 from OpenAI |

### Tab 3: Video Ideas
| Column | Description |
|---|---|
| run_date | Date |
| rank | 1, 2, or 3 |
| topic | Idea title |
| why_trending | Claude explanation |
| competitor_gap | OPEN LANE or competitor name |
| script_outline | Bullet outline |
| approved | TRUE / FALSE |

### Tab 4: Scripts
| Column | Description |
|---|---|
| run_date | Date |
| topic | Approved idea title |
| reel_script | Instagram Reel script text |
| youtube_script | YouTube long-form script text |
| drive_url | Google Drive document link |
| word_count_reel | Word count |
| word_count_yt | Word count |

---

## API design principles
- RESTful local Express endpoints — /api/v1/
- No public endpoints — all calls are localhost-to-localhost
- No rate limiting needed (single user, controlled environment)
- All external API calls (YouTube, Reddit, Tavily, GitHub, Anthropic, OpenAI, Sheets, Drive) go through dedicated service modules in `/src/services/`

---

## Deployment
1. Clone repo to local machine
2. Copy `.env.example` to `.env`, fill in all API keys
3. `pnpm install`
4. `pnpm dev` — app runs on localhost:3000

No staging. No CI/CD pipeline. No cloud. New machine setup target: under 30 minutes.

---

## Known technical debt (v1)
- No script archiving — Drive files accumulate indefinitely
- No error recovery if a run fails mid-way (e.g. Tavily down) — full re-run required
- Google Sheets as DB has no indexing — row scans only
- Reddit public JSON endpoint is unofficial and could break without notice
