# Design Document — ORBIT Dashboard
# Owner: Shuv Gangopadhyay — OrbitumAI

## Vision
ORBIT Dashboard is a personal AI content operations tool for a solo creator. The user opens a local web app, clicks Run Daily, and within 90 seconds sees what competitors haven't covered, what's trending in AI today, and 3 ranked video ideas. They approve one with a single click and receive two complete scripts (Instagram Reel + YouTube) saved to Google Drive — ready to read on their phone before recording. Morning content prep goes from 2-3 hours to under 5 minutes.

---

## Problem being solved
Shuv Gangopadhyay (OrbitumAI) posts on Instagram and YouTube daily. Every morning he manually opens YouTube to check competitors, reads Reddit and AI news, brainstorms ideas, and writes scripts from scratch. This costs 2-3 hours daily, produces inconsistent output, and misses trends and competitor gaps because the process is manual and unstructured.

---

## Target user
- **Primary:** Shuv Gangopadhyay — solo AI content creator, OrbitumAI
- **Secondary:** None — single-user tool, not designed for teams
- **Technical level:** No-code operator — comfortable using apps, not writing code
- **Platforms:** Instagram Reels + YouTube
- **Audience:** SMB owners, executives, no-code builders

---

## Core features (MVP)
1. **Run Daily** — one button triggers the full research, analysis, and idea generation pipeline (~90 seconds)
2. **Competitor Intelligence** — pulls latest competitor YouTube videos + Reddit posts, identifies OPEN LANE gaps via Claude
3. **AI Morning Briefing** — searches web for today's AI news (tools, health, business), trending GitHub repos, hot Reddit debates
4. **Ranked Video Ideas** — exactly 3 ideas per day, ranked by competitor gap opportunity, each with topic, trend reason, research, and script outline
5. **One-Click Script Generation** — approve one idea → Claude writes Instagram Reel script (60-90s) + YouTube script (8-10 min), both saved to Google Drive
6. **Google Sheets as Database** — all data (Competitors, Research, Video Ideas, Scripts tabs) lives in a user-owned Google Sheet
7. **Competitor Channel Management** — add/remove/rename tracked YouTube channels from the Settings screen, stored in Google Sheets

---

## What this app does NOT do
- Does not publish content to Instagram or YouTube
- Does not edit video
- Does not track post-publish performance
- Does not support multiple users
- Does not run in the cloud — localhost only, no internet-facing server
- Does not use Telegram or any external notification tool
- Does not have a mobile app
- Does not use a traditional database (no Supabase, no PostgreSQL)

---

## Visual Design Language

### Reference
Inspired by the Crextio dashboard pattern: fixed sidebar navigation, stat card row at the top of each page, card-based content grid below, warm cream/beige backgrounds, golden yellow primary accent, pill-shaped status badges, clean Inter typographic hierarchy.

### Font
**Inter** — loaded via Google Fonts or local. Applied globally via `font-family: 'Inter', sans-serif`. All weights used: 400, 500, 600, 700.

### Theme
**Light/warm** — cream and beige backgrounds with a golden yellow accent. Modern, clean, operational feel. Dark feature card reserved for the primary hero/profile panel on Dashboard.

### Color system
| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#F5F0E6` | App background (warm cream) |
| `bg-sidebar` | `#EDE8DA` | Sidebar background (slightly deeper cream) |
| `bg-card` | `#FFFFFF` | Standard card / panel backgrounds |
| `bg-card-dark` | `#1E1E28` | Dark hero card (Dashboard primary panel) |
| `bg-card-accent` | `#FEF9EC` | First stat card tinted background |
| `accent-yellow` | `#EAB308` | Primary actions, OPEN LANE badge, active nav item, progress fills |
| `accent-yellow-subtle` | `#FEF08A` | Hover states, selected row tint |
| `accent-yellow-dark` | `#CA8A04` | Pressed / deep accent |
| `text-primary` | `#111827` | Headings, large numbers |
| `text-secondary` | `#6B7280` | Labels, subtitles, metadata |
| `text-on-dark` | `#F9FAFB` | Text on dark cards |
| `text-muted` | `#9CA3AF` | Timestamps, micro text |
| `border` | `#E5E0D5` | Card borders, table dividers |
| `border-dark` | `#2D2D3A` | Borders on dark cards |
| `badge-open-lane` | `#EAB308` fill, `#111827` text | OPEN LANE competitor gap badge |
| `badge-covered` | `#F97316` fill, white text | Competitor has covered this topic |
| `badge-pending` | `#E5E7EB` fill, `#6B7280` text | Idea not yet reviewed |
| `badge-approved` | `#22C55E` fill, white text | Idea approved |
| `badge-connected` | yellow dot prefix | API service connected |
| `badge-error` | red dot prefix | API service disconnected |
| `danger` | `#EF4444` | Destructive actions |

### Typography — Inter font scale
| Level | Size | Weight | Usage |
|---|---|---|---|
| Page title | 24px | 700 | Screen heading (e.g. "Dashboard") |
| Page subtitle | 14px | 400 | One-line screen descriptor |
| Stat number | 36px | 700 | Primary metric on stat cards |
| Card heading | 16px | 600 | Section/card titles |
| Body | 14px | 400 | All content text |
| Label / badge | 12px | 500 | Status badges, metadata tags |
| Micro | 11px | 400 | Timestamps, secondary metadata |

### Spacing & layout
- Sidebar width: 220px, fixed
- Content area: fluid, min 800px
- Card gap: 16px
- Card padding: 20px
- Border radius: 12px (cards), 8px (buttons), 20px (badges)
- Stat card row: 4 columns, equal width — first card uses `bg-card-accent` (yellow-tinted) to highlight the primary metric

### Buttons
- **Primary:** filled yellow (`accent-yellow`), dark text (`#111827`), 8px radius — used for Run Daily, Approve
- **Secondary:** white background with `border` stroke, `text-primary` label — used for Open in Drive, View Sheet
- **Destructive:** `danger` red fill, white label — used only for Remove competitor (requires confirmation)

### Status badges
Pill-shaped, 12px text, 4px vertical / 10px horizontal padding:
- `OPEN LANE` — yellow background, dark text — highest priority signal
- `In Progress` — amber background, dark text
- `Completed` — green background, white text
- `Pending` — light grey background, muted text
- `Connected` — yellow dot prefix
- `Disconnected` — red dot prefix

---

## Layout structure

### Global layout
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (220px fixed)  │  MAIN CONTENT (fluid)     │
│  ─────────────────────  │  ─────────────────────    │
│  Logo + product name    │  Page title + subtitle    │
│  ─────────────────────  │  Primary action button(s) │
│  MENU section           │  ─────────────────────    │
│    Dashboard  ← active  │  Stat card row (4 cols)   │
│    Competitors          │  ─────────────────────    │
│    Research Brief       │  Content grid             │
│    Video Ideas          │  (cards, tables, lists)   │
│    Scripts              │                           │
│    Settings             │                           │
└─────────────────────────────────────────────────────┘
```

### Sidebar
- Logo / wordmark at top (ORBIT + OrbitumAI)
- Section label "MENU" in `text-secondary` 11px uppercase
- 6 nav items with icon + label; active item has green left border + `accent-green-subtle` background
- No bottom section (single user — no logout needed)

---

## Screens

### 1. Dashboard
**Purpose:** Status at a glance. Run Daily is the primary action.

**Stat card row (4 cards):**
| Card | Metric | Highlight |
|---|---|---|
| Ideas Today | 0–3 | Green (primary card) |
| Scripts Generated | count this week | Normal |
| Competitors Tracked | channel count | Normal |
| Last Run | timestamp or "Not yet today" | Normal — shows elapsed time |

**Content grid (2 columns):**
- Left col: **Run Daily card** — large green button centered, status message below ("Ready to run" / "Running..." / "Last run: 7:03 AM"), live step-by-step progress bar during run (3 steps: Researching competitors → Gathering AI news → Generating ideas)
- Right col: **Today's output card** — list of what was produced in the last run (ideas count, scripts count, Drive links if available)

**Progress bar (during run):**
- 3 steps shown horizontally with connecting line
- Active step pulses green
- Completed steps show green checkmark
- ETA shown below ("~45 seconds remaining")

---

### 2. Competitors
**Purpose:** See what competitors posted today and where the gap is.

**Top card — Gap Analysis (full width):**
- Claude's competitor gap analysis in plain English
- Large `OPEN LANE` badge if a gap exists
- `text-secondary` description of what no competitor has covered

**Stat row (3 cards):** Videos tracked today | Reddit posts scanned | Open lanes found

**Content table:**
| Column | Content |
|---|---|
| Channel / Source | Logo icon + name |
| Title | Video or post title (linked) |
| Published | Relative time ("2 hours ago") |
| Gap Status | OPEN LANE / Covered badge |

Rows alternate bg-card / bg-base for readability.

---

### 3. Research Brief
**Purpose:** Today's AI morning briefing.

**Stat row (3 cards):** Stories found | GitHub repos trending | Reddit debates surfaced

**Briefing card (full width):**
- Claude-written narrative, structured sections:
  - Top 5 AI Stories (numbered list, each with source badge)
  - Top 3 GitHub Repos (repo name + plain-English explanation for non-technical readers)
  - Hottest Reddit Debate (subreddit badge + summary)
  - Suggested Content Angle (highlighted green callout block)

**Source table below:**
All raw articles with title, source, relevance score (1–10 badge), and link.

---

### 4. Video Ideas
**Purpose:** Review and approve one of 3 ranked ideas.

**Stat row (3 cards):** Ideas generated | Open lanes | Ideas approved today

**3 idea cards — stacked vertically, full width:**
Each card contains:
```
┌─────────────────────────────────────────────────────┐
│  #1  [OPEN LANE badge]           [Approve button]   │
│  Topic title (18px, bold)                           │
│  ─────────────────────────────────────────────────  │
│  Why trending today   │  Research behind it         │
│  (2-3 sentences)      │  (bullet points)            │
│  ─────────────────────────────────────────────────  │
│  Script outline (collapsible, collapsed by default) │
└─────────────────────────────────────────────────────┘
```
- Card #1 has a subtle green left border (highest ranked)
- Approved card shows "✓ Approved — Scripts generating..." then Drive link
- Only one card can be approved per run

---

### 5. Scripts
**Purpose:** View and access all generated scripts.

**Stat row (3 cards):** Total scripts generated | This week | This month

**Script list — one row per approved idea:**
Each row is expandable:
- Collapsed: topic title | run date | word count (Reel + YT) | Open in Drive button
- Expanded: two panels side by side — Reel script preview (left) + YouTube script preview (right), both truncated at 300 words with "View full in Drive" link

---

### 6. Settings
**Purpose:** API connection status and competitor channel management.

**Section 1 — API Connections:**
8 rows, one per service. Each row:
```
[Service icon]  Service name        [● Connected]  [sk-ant-••••7f2a]
```
- Green dot = connected, red dot = error
- Masked key shows first 4 chars + `••••` + last 4 chars
- Error state shows red badge + "Check .env" tooltip

**Section 2 — Competitor Channels:**
- Table of tracked channels: channel name | channel ID | added date | Remove button
- "Add Competitor" input field: paste YouTube channel URL or ID → validate → Add button
- Changes save instantly to Google Sheets and take effect on next run

---

## UI principles
- **Theme:** Light/warm — cream base with yellow accent, Inter font throughout, Crextio-inspired layout
- **Navigation:** Fixed left sidebar, 6 items, always visible — no hamburger menu; active item has yellow left border + yellow-tinted background
- **Signal priority:** OPEN LANE badge in yellow is always the most prominent signal on any screen
- **Stat card row:** Every screen opens with a stat card row — gives instant context before scrolling
- **First card highlighted:** The primary metric on each page uses the yellow-tinted card (`bg-card-accent`)
- **Dark hero panel:** Dashboard uses one dark (`bg-card-dark`) card to show the primary run status — mirrors the Crextio profile card pattern
- **Scannability:** Idea cards and competitor rows must be scannable in under 10 seconds
- **Collapsed defaults:** Script previews, idea outlines collapsed by default — Drive link is primary action
- **Progress feedback:** All async operations (Run Daily, script generation) show live step-by-step progress — never a spinner alone
- **No decoration:** No illustrations, no random gradients, no hero images — every element is functional
- **Font loading:** `<link>` tag for Inter via Google Fonts at app entry point; fallback: `sans-serif`

---

## Data integrations
| Service | Role |
|---|---|
| YouTube Data API v3 | Fetch latest competitor channel videos |
| Reddit public JSON | Hot posts from r/artificial, r/MachineLearning, r/nocode (no API key) |
| Tavily | Web search for today's AI news |
| GitHub Token | Trending AI/ML repositories |
| Anthropic Claude | All writing: gap analysis, briefing, ideas, scripts |
| OpenAI | Scoring, ranking, enrichment, summarisation of raw data |
| Google Sheets | Database — Competitors, Research, Video Ideas, Scripts tabs |
| Google Drive | Script file storage — opened on phone before recording |

---

## AI role clarity
- **Anthropic Claude** — all qualitative analysis and writing (gap analysis, briefing narrative, idea generation, Reel script, YouTube script)
- **OpenAI** — structured data tasks (scoring articles by relevance, extracting data points, summarising GitHub repos, cross-checking idea quality)
- Both run automatically in the background; user never chooses between them
