# LAB 03 – HOMEWORK 3
## KRAFTON x PUBG Vietnam Championship & Airdrop Arena

**Tech Stack:** React 19, Vite, JavaScript, CSS Modules

**Commit Target:** 17 commits across 5 steps

**Current Status:** STEP 1 – IN PROGRESS

## 1. Requirements Checklist

- [x] Initialize React 19 + Vite project
- [x] Configure local Git author
- [x] Create PUBG Arena foundation
- [x] Create project-rules.md
- [ ] Implement Arena UI and item cards
- [ ] Implement PUBG Vietnam Leaderboard
- [ ] Implement Kill-Feed filtering
- [ ] Implement anti-drift countdown
- [ ] Implement Airdrop State Machine
- [ ] Implement optimistic claim
- [ ] Handle HTTP 409 rollback
- [ ] Prevent duplicate claims and race conditions
- [ ] Add automated tests
- [ ] Complete accessibility verification
- [ ] Complete AI Failure Audit

## 2. Component Architecture

App
  ArenaShell
    ArenaHeader
    DropCatalog
      DropCard
        AirdropCountdown
        ClaimButton
    SquadLeaderboard
    KillFeed
    ClaimStatus

Feature directory:

src/homeworks/KraftonPubgVnArena/

Create components, hooks, data, domain, services and tests directories only when needed.

## 3. Data Contracts

PubgCrateDrop:
- id: string
- title: string
- priceVnd: number
- remainingStock: number
- dropEpochMs: number

PubgVnSquadStanding:
- squadId: string
- squadName: string
- wwcdCount: number
- placementPts: number
- killPts: number

Rules:
- Use JSDoc for data contracts.
- Use stable IDs.
- Use immutable state.
- Format VND using Intl.NumberFormat('vi-VN').
- Clearly label simulated tournament data.

## 4. Anti-Drift Countdown

Hook:
usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0)

Formula:
remainingMs = Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))

Requirements:
- Recalculate using absolute timestamps.
- Synchronize on visibilitychange.
- Cleanup intervals and event listeners.
- Avoid duplicate intervals.
- Stop updating when countdown reaches zero.
- Verify background-tab recovery.

## 5. Airdrop State Machine

States:
- WARMUP
- AIRDROP_LIVE
- LOOTED_OUT
- EXPIRED

Transition rules:
1. Before opening time: WARMUP.
2. At or after expiry time: EXPIRED.
3. During active window with stock zero: LOOTED_OUT.
4. During active window with stock available: AIRDROP_LIVE.

Expiry time = dropEpochMs + claimWindowMs.

Use one derived domain status.
Avoid contradictory boolean states.

## 6. Optimistic Claim Architecture

Claim flow:
1. Verify item is AIRDROP_LIVE.
2. Verify remainingStock > 0.
3. Acquire per-item in-flight lock.
4. Optimistically decrease displayed stock.
5. Call simulated claim API.
6. Success: confirm updated stock.
7. HTTP 409: reconcile with authoritative mock server stock.
8. Other failure: rollback safely.
9. Release in-flight lock.

Safety:
- Prevent duplicate requests.
- Never allow negative stock.
- Handle concurrent claims.
- Ignore stale requests.
- Prevent updates after unmount.
- Keep client and server mock states consistent.

No real payment or PUBG API integration.

## 7. Leaderboard Architecture

Mock teams:
- The Expendables (TE)
- Cerberus Esports (CES)
- Roy Esports
- AGG

Features:
- Sort by WWCD.
- Sort by Placement Points.
- Sort by Kill Points.
- Filter leaderboard.
- Filter kill-feed events.

Use stable squadId/eventId.
Derive sorted and filtered arrays.
Never mutate source arrays.

## 8. React 19 and Accessibility

- Functional components only.
- createRoot and StrictMode.
- Semantic HTML.
- CSS Modules.
- Keyboard navigation.
- Accessible labels.
- Visible focus indicators.
- aria-live for relevant status feedback.
- WCAG 2.2 AA.
- Responsive 375px–1440px.
- Lighthouse Accessibility target: 100.
- Proper effect cleanup.
- No legacy React APIs.

## 9. Verification Checklist

- [ ] npm run lint
- [ ] npm run build
- [ ] Timer unit tests
- [ ] FSM transition tests
- [ ] Claim success tests
- [ ] HTTP 409 rollback tests
- [ ] Duplicate-click prevention tests
- [ ] Unmount safety tests
- [ ] Leaderboard filtering tests
- [ ] Responsive browser checks
- [ ] Keyboard accessibility checks
- [ ] Lighthouse accessibility audit
- [ ] AI_FAILURE_AUDIT.md with 3 real failures, evidence and fixing commits

## 10. Git Commit Plan

STEP 1 – PROJECT SETUP (2)
- DONE: chore(hw3): initialize react19 pubg arena project
- IN PROGRESS: docs(hw3): define arena architecture and task decomposition

STEP 2 – ARENA UI (4)
- TODO: feat(hw3): add arena layout and item catalog
- TODO: feat(hw3): render ticket and crate cards
- TODO: feat(hw3): add leaderboard sorting and filters
- TODO: feat(hw3): implement kill feed and responsive layout

STEP 3 – TIMER AND FSM (4)
- TODO: feat(hw3): implement anti drift countdown hook
- TODO: test(hw3): verify countdown and tab recovery
- TODO: feat(hw3): implement airdrop state machine
- TODO: feat(hw3): integrate timer with drop availability

STEP 4 – CLAIM AND ROLLBACK (4)
- TODO: feat(hw3): add mock claim API
- TODO: feat(hw3): implement optimistic stock updates
- TODO: fix(hw3): handle 409 rollback and claim races
- TODO: test(hw3): cover claim outcomes and cleanup

STEP 5 – FINAL VERIFICATION (3)
- TODO: fix(hw3): improve accessibility and responsive UX
- TODO: test(hw3): verify application and document AI failures
- TODO: docs(hw3): finalize submission checklist

TOTAL: 17 planned commits.

Commit messages may be adjusted to reflect actual changes.
Do not invent AI failures or create empty commits.

## 11. Workflow

PLAN → IMPLEMENT → VERIFY → COMMIT

Update this document before implementing each step.
Mark completed tasks as DONE only after verification.
Stop after Step 1 until the next implementation request.

STEP 2 DELIVERY PLAN - IN PROGRESS

Commit 3: Define PUBG Arena datasets
- Ticket and G-Coin crate data
- Four simulated PUBG squads
- Simulated kill-feed events
- Validate data contracts and stable IDs

Commit 4: Build championship arena interface
- Arena header and overview
- Item cards with VND prices and stock
- Countdown and claim placeholders

Commit 5: Implement sortable leaderboard
- WWCD, placement and kill points
- Search, sorting and empty state

Commit 6: Add kill-feed filters and responsive layout
- Squad and weapon filters
- Responsive 375px-1440px
- Accessibility and UI verification

Step 3 timer, FSM and Step 4 claim logic are excluded.
