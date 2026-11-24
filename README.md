# GSoC Navigator OS 2027
## An Intelligent, Evidence-Based Open-Source & Google Summer of Code Preparation Platform

**Target Contributor Profile:** Madhava (B.Tech CSE '28, GITAM University, Visakhapatnam)  
**Primary Program:** Google Summer of Code (GSoC) 2027  
**Core Mission:** Move from language fundamentals to becoming an independent, credible, and technically capable open-source contributor.

---

## 1. System Architecture Overview

GSoC Navigator OS is designed as a unified full-stack operating system:

```
                            ┌──────────────────────────────────────────────┐
                            │        Web Client (React / TypeScript)       │
                            │ 14 Specialized Modules • Modern Dark UI     │
                            └──────────────────────┬───────────────────────┘
                                                   │ REST API & Realtime Sync
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │           FastAPI Backend Gateway            │
                            │      Async Lifespan & Dependency Injection   │
                            └──────┬───────────────┬───────────────┬───────┘
                                   │               │               │
        ┌──────────────────────────▼─────┐  ┌──────▼────────┐  ┌───▼───────────────────────────┐
        │       Intelligence Agents      │  │ Background Wkr│  │       Integrations            │
        │ • Program Intelligence         │  │ • Persistent  │  │ • GitHub REST & GraphQL API   │
        │ • Org Discovery & Fit Scorer   │  │ • Source Diff │  │ • Official GSoC Scrapers      │
        │ • Repository Architecture      │  │ • Notification│  │ • Modular LLM Provider         │
        │ • Dual-Axis Issue Classifier   │  │   Pipeline    │  │   (Gemini/OpenAI/Heuristic)   │
        │ • 8-Step Contribution Coach    │  │ • Catch-Up    │  │ • Webhook Ingestion           │
        │ • PR Quality Auditor           │  │   Engine      │  │                               │
        │ • Proposal Studio & Reviewer   │  │               │  │                               │
        └──────────────────────────┬─────┘  └──────┬────────┘  └───┬───────────────────────────┘
                                   │               │               │
                                   └───────────────┼───────────────┘
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │    Relational Storage (SQLAlchemy / SQLite)   │
                            │  Users • Skills • Orgs • Repos • Issues • PRs│
                            │  Coaching • Proposals • Sources • Tasks      │
                            └──────────────────────────────────────────────┘
```

---

## 2. Implemented Modules (14 Unified Sections)

1. **Overview (Command Center):** Daily execution dashboard answering *"Where do I stand today, and what should I execute next?"*. Includes prioritized task engine with completion criteria.
2. **GSoC Intelligence:** Authoritative guidelines, verified contributor eligibility checks (GITAM 2028 verified), and timezone-aware program timeline strictly distinguishing verified dates from planning estimates.
3. **Organization Discovery:** Algorithmic fit scoring based on language overlap, past GSoC participation history (e.g. SymPy 7+ years), community responsiveness, and skill gaps. Side-by-side comparison.
4. **Repository Intelligence:** Codebase structural analysis, file tree explorer, key entry points, and local build/test execution instructions.
5. **Live Contribution Intelligence:** Real-time tracking of GitHub pull requests, commits count, lines changed, maintainer feedback notes, and demonstrated competencies.
6. **Intelligent Issue Explorer:** Mandatory dual-axis classification: **Severity (S0–S4)** and **Difficulty (Level 1–5)**. Segregated into *Start Now*, *Stretch Goals*, and *Advanced*.
7. **Personal Contribution Coach:** 8-Step interactive guided investigation (*Understand → Investigate → Learn → Debug → Implement → Test → Review → Submit Preparation*) in Mentor or Assistance mode.
8. **Pull Requests Intelligence:** Pre-submission code quality auditor detecting missing regression tests, bare exception handling, and naming conventions.
9. **Skill Development:** Living skill profile tracking verified evidence from PRs versus self-reported experience, identifying specific weaknesses and targeted drills.
10. **Project Ideas Intelligence:** Curated GSoC project descriptions, required prerequisites, and scope estimates.
11. **Proposal Development Studio:** 12-week milestone structuring, mandatory buffer week validation, risk mitigation, and automated critical peer review.
12. **Timeline & Deadlines:** Countdown tracker with timezone awareness and source provenance.
13. **Persistent Notifications:** Server-side background change detection on official sources with personal impact analysis.
14. **Settings:** Profile management, GitHub personal access token integration, and monitoring health diagnostics.

---

## 3. Quick Start & Execution

### Prerequisites
- Python 3.10+ (Tested on Python 3.14.3)
- Node.js 18+ (Tested on Node.js v24.18.0)

### Running the Backend & Web Client (Production Mode)
```powershell
cd C:\Users\madha\gsoc-navigator-os\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Open your browser to: **`http://localhost:8000`** (Access both the interactive UI and the API documentation at **`http://localhost:8000/docs`**).

### Running in Frontend Development Mode (Hot Reload)
```powershell
cd C:\Users\madha\gsoc-navigator-os\frontend-app
npm run dev
```
Open **`http://localhost:3000`**.

---

## 4. Test Suite Verification

The complete test suite verifies all Acceptance Criteria (Tests A through L):

```powershell
cd C:\Users\madha\gsoc-navigator-os\backend
python -m pytest tests -v
```

### Verified Test Cases:
- `test_onboarding.py`: User profile persistence, living skills evidence update, and stage tracking.
- `test_gsoc_intelligence.py`: Contributor eligibility verification, GSoC 2027 confirmed vs estimated date differentiation, and organization fit scoring.
- `test_repository_and_issues.py`: Repository file tree indexing, dual-axis issue classification (Severity S0–S4, Difficulty L1–L5).
- `test_coaching_workflow.py`: 8-step coaching session state machine progression.
- `test_contributions_and_pr.py`: Pull request tracking, automated quality audit, maintainer feedback logging, and evidence-based skill level upgrade.
- `test_proposal_audit.py`: Proposal milestone validation, buffer week detection, and quality review scoring.
- `test_monitoring_and_deadlines.py`: Background source monitoring, diff detection, health tracking, and task prioritization engine.

**Result: 12 passed in 5.59s (100% test pass rate).**
