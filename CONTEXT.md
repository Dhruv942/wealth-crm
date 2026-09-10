# K2 WealthDesk — RM Co-Pilot & Standalone Task Allocation Desk

## 1. Executive Summary & Market Thesis

- **The Market Opportunity**: Private Equity capital influx into Indian Wealth Management (360 ONE, Nuvama, Kotak Private, Avendus) has created fierce bidding wars for senior Relationship Managers (RMs). Mid-tier and boutique wealth firms cannot afford ₹40L+ CTC packages and are forced to hire raw, early-career RMs.
- **The Operational Bottleneck**: Early-career RMs struggle with HNWI portfolio diagnostics, freeze during market drawdowns, neglect CRM logging (15–20 mins of tedious admin), and drop operational balls (CAMS Re-KYC, STP setup, tax harvesting).
- **The Product**: **K2 WealthDesk** is an institutional-grade, zero-bloat standalone GUI that pairs a **Daily Standup Task Allocation Desk** with an **AI Advisory Co-Pilot & Auto-CRM Synthesizer**.
- **The Value Proposition**:
  - **For RMs**: Zero-prep client meetings, instant objection defense scripts, and 30-second post-call auto-CRM synthesis + WhatsApp drafts.
  - **For Cluster Heads / Managers**: Real-time workload balancing, SLA countdown tracking, and structured, SEBI-aligned compliance audit trails without micromanagement.

---

## 2. Regional & Compliance Protocol (India)

- **Timezone**: Indian Standard Time (IST / UTC+05:30)
- **Date Format**: `dd-mm-yy` (e.g. 05-09-26)
- **Currency**: Indian Rupee (`₹`) formatted in Crores (`₹ Cr`) and Lakhs (`₹ Lakhs`).
- **Compliance Framework**: Aligned with SEBI's Investment Adviser / Mutual Fund Distributor suitability obligations, CAMS/KRA periodic KYC norms, and RBI's Liberalised Remittance Scheme (LRS) limits. (Note: an earlier draft of this doc cited `SEBI/HO/IMD/DF3/CIR/P/2020/197` here — that circular governs Risk-o-meter product labeling disclosure, not advisor-client suitability, and was a misapplied citation. Don't reintroduce it without checking what it actually covers.)

---

## 3. Architecture & Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans + JetBrains Mono
- **Icons**: Lucide React
- **Runtime**: Zero external backend requirement for local pitch demos (includes rich synthetic Indian HNWI state + interactive simulation).
- **Port**: Runs on `http://localhost:5173/` via `npm run dev`.

### Directory Map

```
wealth-rm-copilot/
├── src/
│   ├── components/
│   │   ├── TaskAllocationDesk.jsx    # Standup board, SLA indicators, role-based isolation
│   │   ├── RMCopilotDossier.jsx      # Pre-call portfolio health, AI talking points, objection defense
│   │   ├── AutoCRMUpdate.jsx         # Voice/notes debrief, CRM synthesis, WhatsApp & ops generation
│   │   └── PartnerOversight.jsx      # Cluster Head management dashboard, capacity matrix, SEBI audit logs
│   ├── mockData/
│   │   └── wealthData.js             # Indian HNWI synthetic datasets, portfolios, scenarios
│   ├── App.jsx                       # Master coordinator, live IST clock, view/role switcher
│   ├── main.jsx                      # Application bootstrap
│   └── index.css                     # Tailwind v4 import & custom scrollbars
├── package.json                      # React 19, Vite 6, Tailwind CSS v4, Lucide React
├── vite.config.js                    # Vite plugins & configuration
└── CONTEXT.md                        # Master architectural context for Antigravity instances
```

---

## 4. Role-Based Views & Book Privacy Shield

In Indian wealth management, advisor client books are strictly confidential to prevent internal poaching and compensation conflict.

### Persona 1: Relationship Manager (RM View)

- **Available Profiles**: `Rahul Sharma (Private Wealth)`, `Priya Nair (Affluent Banking)`.
- **Behavior**:
  - Displays **"My Action Desk"** and **"My Book AUM"** (e.g., ₹85.0 Cr for Rahul, across his full 42-client book).
  - Only shows assigned clients. Full dossiers exist for 3 of Rahul's 42 clients (Vikramaditya Singhania, Sunita & Rajesh Goenka, Kabir Malhotra) — this is a demo subset, not his complete book; the client selector discloses this ("3 of 42 in book (demo)"). Peer accounts (e.g., Dr. Ananya Iyer) are hidden.
  - RMs cannot reassign tasks to peer advisors; they can only advance workflow states or hand off execution to the **Central Ops Desk**.
  - Executive Governance tab is restricted.

### Persona 2: Cluster Head (Manager View)

- **Profile**: `Vikram Mehta (Cluster Head & Managing Director)`.
- **Behavior**:
  - Displays **"Team Standup Board"** and full branch metrics (**₹265.2 Cr AUM**, 96 accounts).
  - Workload balancing controls: can reallocate any task across advisors or ops specialists.
  - Unlocks the **Cluster Head Governance Desk** for team SLA monitoring, capacity limits, and SEBI audit trails.

### Persona 3: Central Operations & Compliance

- Clearing house for KYC refreshes, STP mandates, BSE StAR MF links, and outward LRS remittances.

---

## 5. Core Feature Modules

### Module 1: Task Allocation Desk (`TaskAllocationDesk.jsx`)

- Real-time operational pulse: Tracks Book/Firm AUM, Tasks Due Today, Near-Breach SLAs, and Unallocated Cash.
- 4-Stage Workflow Kanban: `Action Required (RM)`, `In Progress`, `With Central Ops & KYC`, `Completed & Dispatched`.
- SLA badges with pulse alerts for near-breach items (< 3 hours).
- 1-click bridge: Click "Co-Pilot" on any client card to instantly open their dossier.

### Module 2: RM Call Co-Pilot (`RMCopilotDossier.jsx`)

- **Portfolio Health Diagnostics**: Visual comparison of Target Mandate vs Current Allocation (e.g. flagging Vikramaditya Singhania's ₹3.7 Cr equity skew).
- **Capital Leak Detection**: Flags idle savings cash (e.g. ₹45L in Kotak Privy earning 3.5%) vs Arbitrage yields, and tax-loss harvesting windows.
- **Advisory Talking Points**: 4 structured, consultative points for client calls.
- **Objection Defense Drawer**: Quantitative responses to common client objections (real estate vs equities, midcap volatility).

### Module 3: Auto-CRM Meeting Synthesizer (`AutoCRMUpdate.jsx`)

- **3 Sample Call Scenarios** (note: these are canned, pre-written demo scenarios, not a live NLP pipeline — see Section 7, Dev 2):
  - Scenario 1: Gurgaon Commercial Property Liquidity (₹4.2 Cr) & Arbitrage Deployment.
  - Scenario 2: Midcap Drawdown Panic & CAMS Re-KYC Blocker.
  - Scenario 3: Surgeon Clinic Review & Frictionless WhatsApp STP.
- **Voice Dictation / Note Processing**: Synthesis of raw notes into:
  1. **Institutional CRM Record** (timestamped in IST `dd-mm-yy`, structured into Discussion, Sentiment, and Next Steps).
  2. **Pipeline & Liquidity Inflow Signals** (`₹75L received`, `₹3.45 Cr expected 20-10-26`).
  3. **Auto-Extracted Operations Deliverables**: one click genuinely pushes tasks onto the shared Standup Board state (real, not simulated).
  4. **Copy-Ready Client Comms**: one-click copy of WhatsApp and Email drafts to clipboard — the RM still sends these manually, nothing is auto-dispatched.

### Module 4: Cluster Head & Executive Governance (`PartnerOversight.jsx`)

- Branch AUM health, capacity limits, and team SLA matrix.
- Timestamped compliance audit trail. **Currently static/hardcoded — does not yet reflect live actions taken elsewhere in the session. See Section 6.5, Item 2.**

---

## 6. How to Run & Verify on Another Antigravity Instance

1. **Clone or Open Repository**:
   ```bash
   git clone https://github.com/ranjank2alpha/wealth-rm-copilot.git
   cd wealth-rm-copilot
   git checkout dev
   ```
2. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```
3. **Open in Browser**:
   `http://localhost:5173/`
4. **Build Check**:
   ```bash
   npm run build
   ```

---

## 6.5 Demo-Readiness Punch List (Do This First — Before Section 7)

The current build is a fully client-side prototype: no backend, no real AI/NLP (that's Section 7's job). Before it goes in front of another prospect, three concrete bugs need fixing. All three are small, contained, and don't require any of the AI/backend work below — do these first, then move to Section 7.

### Item 1 — Tab switch resets in-progress state, causing duplicate task dispatch

**Root cause**: `App.jsx` conditionally mounts each tab's component (`{activeTab === 'x' && <Component />}`), so switching tabs fully unmounts and remounts it, wiping all local state.
**Observed failure**: In `AutoCRMUpdate.jsx`, dispatch tasks to the Standup Board, switch tabs, come back — the "Dispatch to Standup Board" button is live again as if nothing happened. Click it again and it re-adds the same task objects (same `id`s) to the shared `tasks` array, producing duplicate cards on the Task Allocation Desk and a React duplicate-key warning in the console. This is likely to happen naturally in a live demo, since flipping tabs to prove something worked is exactly what a presenter does.
**Fix**: Stop conditionally unmounting tabs — keep all four tab components mounted and toggle visibility instead (e.g. wrap each in a `hidden` class based on `activeTab`). This also fixes the same root cause in `TaskAllocationDesk.jsx`, whose filters (`selectedRM`, `selectedPriority`, `selectedCategory`) silently reset every time you leave and return to that tab.

### Item 2 — Compliance audit trail is static; never reflects anything that happens in the session

**Root cause**: `auditLogs` in `PartnerOversight.jsx` is a hardcoded local array, not derived from any shared state.
**Observed failure**: The Governance tab's own copy says every task dispatch and CRM sync "generates a timestamped compliance log entry" — but syncing a record or dispatching tasks in `AutoCRMUpdate.jsx` never appends anything here. The natural demo flow (do something in Auto-CRM, then check Governance to see it logged) shows nothing changing, directly contradicting the module's own claim.
**Fix**: Lift the audit log into shared state (`App.jsx` or a context). Have `handleSyncToCRM` and `handleDispatchOpsTasks` in `AutoCRMUpdate.jsx` push a real entry (timestamp, event, client, advisor, detail) when they fire; `PartnerOversight.jsx` renders that shared list, seeded with the 4 existing entries as history. Pairs naturally with Item 1's state-lifting work — same person should probably do both.

### Item 3 — "Unallocated Idle Cash" stat is hardcoded and identical for every RM

**Root cause**: `TaskAllocationDesk.jsx` hardcodes `'₹45.0 Lakhs'` for any non-manager view, regardless of which RM is logged in.
**Observed failure**: Rahul Sharma and Priya Nair show the identical ₹45.0 Lakhs figure. The real sum of their respective named clients' `idleSavings` is roughly ₹1.45 Cr for Rahul and ₹22 Lakhs for Priya — nowhere near each other, and nowhere near the hardcoded number.
**Fix**: Add a numeric field (e.g. `idleSavingsNumeric`, in Lakhs) alongside the existing display string on each `CLIENT_PROFILES` entry, then derive the stat per RM as `CLIENT_PROFILES.filter(c => c.assignedRMId === currentRM.id).reduce((sum, c) => sum + c.idleSavingsNumeric, 0)`. Small, mechanical change — natural to bundle with whoever touches `wealthData.js` for Dev 1's real data-feed work in Section 7.

---

## 7. Handover Specification for the 3 Production Developers

### Dev 1: Backend & Wealth CRM Integration

- Connect webhooks from `AutoCRMUpdate` to wealth CRMs (Salesforce Financial Services Cloud, Zoho CRM, LeadSquared).
- Interface with back-office portfolio engines (Miles Software WealthMaker, WealthSpectrum) to fetch nightly valuation feeds.
- Implement CAMS / KFintech mutual fund order execution APIs (BSE StAR MF / NSE NMF II).

### Dev 2: AI Pipeline & Audio Engine

- Implement Dual-Tier AI architecture:
  - **Insight Tier (Gemini 3 Flash)**: Complex portfolio skew analysis and personalized objection defense scripts.
  - **Protocol Tier (Gemma 4)**: High-speed extraction of liquidity amounts, task titles, and sentiment from raw RM audio.
- Integrate speech-to-text model (Gemini Multimodal Audio or Whisper) for live call recording & dictation.

### Dev 3: Security, Multi-Tenancy & SEBI Audit

- Implement Role-Based Access Control (Cluster Head, Senior RM, RM, Back-Office Ops).
- Establish tenant isolation for multi-firm SaaS deployments.
- Build append-only audit trail logging for SEBI inspection readiness.

---

## 8. Dev Build Required — Mocked Features From This Phase

Section 7 above describes the 3 production workstreams in general terms. This section is more specific: it is a feature-by-feature list of everything in the current build that _looks_ AI-powered or backend-connected but is actually a client-side mock, with the exact file, the exact fake mechanism, and what a real developer must build to replace it. Every mock listed here is also flagged in-code with a `// MOCK — see CONTEXT.md "Dev Build Required"` comment and, where it's user-visible, an on-screen badge (e.g. "Mock scoring — see CONTEXT.md"), so nothing here is silently passed off as real inside the demo itself.

Two features that were discussed and deliberately **excluded** from this list: a live portfolio-rebalancing simulator (rejected as scope creep — it strays from an RM co-pilot/CRM tool into regulated portfolio-construction advice) and a generic AI chatbot window (rejected because no credible benchmark competitor uses that UI pattern for this use case, and it can't be built honestly in a client-side demo without either exposing an API key or fabricating its answers). Neither is mocked anywhere in this codebase.

### 8.1 Manager Coaching / Call-Quality Score

**Where**: `mockData/wealthData.js` — `callQuality` object on each `DEMO_CALL_SCENARIOS` entry (`score`, `complianceMentioned`, `objectionAnticipated`, `tone`, `coachingNote`). Rendered in `PartnerOversight.jsx`'s "Call Quality & Coaching" card (badged "Mock scoring — see CONTEXT.md").
**What's fake**: The scores (8.5, 9.2, 7.8) and coaching notes were written by hand for the 3 demo scenarios. There is no model listening to or scoring any call.
**Real build**: Feed the call transcript (from 8.3's real speech-to-text output) into a scoring model — either a fine-tuned classifier trained on a labeled set of RM calls (compliance mention detected, objection handled, tone classified), or an LLM-as-judge prompt (Dev 2's Insight Tier, Gemini 3 Flash) with a rubric agreed with Compliance and the training team. Output needs to be per-call, versioned, and auditable (store the model version and prompt/rubric alongside the score) since it will be used in performance reviews — never let this be a black-box number.

### 8.2 House View Reference Library

**Where**: `mockData/wealthData.js` — `HOUSE_VIEWS` export (4 entries: Global Equity & Macro Outlook, Fixed Income & Rate Trajectory, Geopolitical Risk & Hedging, Gold & Alternates). Rendered in `App.jsx`'s House View slideover (badged "Mock content — see CONTEXT.md"), searchable but static.
**Why this exists**: This is the answer to "should we add a house-view chatbot for esoteric questions like 'how does the war affect my portfolio'" — a chatbot was rejected (see above) because it either needs a real LLM with real access to the firm's actual approved research (expensive, and still needs guardrails against giving unapproved advice) or it fabricates answers, which is a compliance risk with real client money. A searchable library of pre-approved, attributed house views is the honest vers
ion of the same intent: it answers "what's our view on X" without ever inventing a view the Investment Committee hasn't actually signed off on.
**Real build**: Replace the hardcoded array with a live feed from wherever the firm's Investment Committee actually publishes approved research (a CMS, a shared drive with a metadata index, or a research-desk API). Keep the `approvedBy` / `lastReviewed` fields wired to that system's real values — those two fields are the whole compliance point of this feature and must never be hardcoded once real. If a genuine LLM layer is added later, it should be constrained to summarizing/searching _within_ this approved corpus (retrieval-augmented, not open generation), never answering freeform outside it.

### 8.3 Heuristic NLP Extraction for Free-Typed Call Notes

**Where**: `mockData/mockNlpPipeline.js` (`mockExtractFromNotes`), wired into `AutoCRMUpdate.jsx`'s `handleSynthesize`. Runs only when an RM types notes that don't match one of the 3 pre-written `DEMO_CALL_SCENARIOS`; otherwise the canned `parsedResult` is used.
**What's fake**: This is regex/keyword matching (a fixed `THEME_RULES` list, a positive/negative word list for sentiment), not a language model. It will visibly get things wrong on notes it wasn't tuned for — that's expected and disclosed in its output (`[Heuristic extraction — not a real NLP model]` prefix on the summary).
**Real build**: This is Dev 2's Protocol Tier from Section 7. Replace `mockExtractFromNotes` entirely with a call to a real LLM (Gemma 4 or equivalent fast-tier model) prompted to extract: discussion summary, sentiment, liquidity/amount signals, suitability-guardrail flags, and candidate ops tasks — matching the exact output shape `mockExtractFromNotes` already returns (`summary`, `sentiment`, `liquiditySignals[]`, `suitabilityGuardrail`, `generatedOpsTasks[]`, `whatsappDraft`, `emailSubject`, `emailBody`, `crmStageUpdate`), so it's a drop-in replacement for the one call site in `AutoCRMUpdate.jsx`. The `suitabilityGuardrail` field in particular is currently just a placeholder string ("not yet checked") — in production this must actually run the extracted signals against the client's real risk mandate before the record can sync, not just say it should.

### 8.4 Voice Dictation Auto-Fill

**Where**: `AutoCRMUpdate.jsx` — the "Voice Memo" button next to the notes textarea.
**What's fake**: There is no microphone access and no speech-to-text. Clicking it to "start" shows a toast ("Simulating live speech-to-text audio dictation..."); clicking it again to "stop" drops the scenario's pre-written transcript into the textarea and shows a second toast confirming it's a mock. No audio is ever captured.
**Real build**: Capture microphone audio (`MediaRecorder` API) while "recording," stream or batch it to a speech-to-text service (Dev 2's suggestion: Gemini Multimodal Audio or Whisper), and populate the textarea with the real transcript as it arrives (ideally incrementally, so the RM sees it being transcribed live rather than dumped in all at once). Needs a fallback UX for poor connectivity and a way to correct mis-transcriptions before synthesis runs.

### 8.5 CRM Sync Confirmation Record

**Where**: `AutoCRMUpdate.jsx` — `handleSyncToCRM`, and the confirmation card that appears after a successful sync ("CRM confirmation received," badged "Mock ID — see CONTEXT.md").
**What's fake**: `handleSyncToCRM` generates a client-side string (`MOCK-CRM-<clientId>-<timestamp>`) and displays it as if it were an external record ID returned by a CRM. No CRM is actually called.
**Real build**: This is Dev 1's webhook work from Section 7. `handleSyncToCRM` must call the real CRM's write API (Salesforce FSC, Zoho, or LeadSquared per Section 7) with the confirmed summary, liquidity signals, and stage update, and display the record ID **the CRM itself returns** in its response — never a locally generated one. Also needs real error handling (today there is no failure path at all): a failed sync must surface as a failed sync, with a retry affordance, not silently succeed.
