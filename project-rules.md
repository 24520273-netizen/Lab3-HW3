LAB 03 – HOMEWORK 3
KRAFTON x PUBG Vietnam Arena

TECH STACK
- React 19 with Vite and JavaScript
- Functional components and React StrictMode
- CSS Modules
- Semantic HTML and WCAG 2.2 AA

DEVELOPMENT RULES
- Plan → Implement → Verify → Commit
- Maintain TASK_DECOMPOSITION.md
- Prefer immutable state and derived state
- Use stable IDs for data and React keys
- Cleanup timers, listeners and async operations
- Avoid React legacy patterns
- Label all simulated tournament data clearly

FEATURE REQUIREMENTS
- Arena UI, Tickets and G-Coin Crates
- Anti-drift countdown using Date.now()
- WARMUP / AIRDROP_LIVE / LOOTED_OUT / EXPIRED
- Optimistic claim and HTTP 409 rollback
- In-flight locks and race-condition protection
- Leaderboard and kill-feed filtering
- Responsive layout: 375px to 1440px

GIT RULES
- Aim for 17 meaningful commits
- Use local Git author configuration
- Never push without explicit permission
- Do not change other homework repositories

VERIFICATION
- npm run lint
- npm run build
- Relevant unit and integration tests
- Browser and accessibility testing
- Record at least 3 actual AI failures with evidence
