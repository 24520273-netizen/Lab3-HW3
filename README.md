**LAB 03 – HOMEWORK 3**

**KRAFTON x PUBG Vietnam Championship & Airdrop Arena**

An educational React 19 application simulating PUBG Vietnam Championship ticket drops, G-Coin crates, standings and claim workflows.

**TECH STACK**

- React 19
- Vite
- JavaScript
- CSS Modules
- Node.js native test runner

**FEATURES**

- Championship Arena and item catalog
- Vietnamese currency and inventory display
- Sortable squad leaderboard
- Filterable kill-feed
- Anti-drift countdown and visibility synchronization
- Airdrop finite state machine
- Optimistic Claim and HTTP 409 rollback
- Mock API, idempotency protection and Demo Clock
- Responsive and keyboard-accessible interface

**RUN PROJECT**

npm install
npm run dev

**VERIFY**

npm run test
npm run lint
npm run build

**PRODUCTION PREVIEW**

npm run preview

**TEST CLAIM WORKFLOW**

1. Enable Preview live claim window (demo).
2. Claim a VIP Ticket or G-Coin Crate.
3. Verify the stock decreases by one.
4. Select Simulate next HTTP 409.
5. Claim again and verify stock rollback.
6. Retry to test recovery.

**LIMITATIONS**

This project is an educational simulation.
No official PUBG API, payment or account system is connected.
Mock inventory resets after page reload.
All tournament standings and kill-feed events are simulated.

**DOCUMENTATION**

- project-rules.md
- TASK_DECOMPOSITION.md
- AI_FAILURE_AUDIT.md
- SUBMISSION_CHECKLIST.md
