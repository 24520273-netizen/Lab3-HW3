**LAB 03 – HOMEWORK 3**
**AI FAILURE AUDIT**

Project: KRAFTON x PUBG Vietnam Championship & Airdrop Arena

This document records three observed failures during AI-assisted development. All evidence comes from actual terminal logs or Lighthouse screenshots.

---

**FAILURE 1 – React 19 Ref Access During Render**

Related task:
Step 4 – Integrating Mock Claim API and Demo Clock.

AI-generated problematic code:

const [claimApi] = useState(() =>
  createMockClaimApi(dropItems, {
    now: () => Date.now() + timeOffsetRef.current,
  }),
)

Observed error:
ESLint reported "Cannot access refs during render".
Rule: react-hooks/refs.
Location: ArenaShell.jsx, line 19.

Technical cause:
A ref was captured inside a function passed to an initialization call during rendering. React 19 lint rules flagged this as potentially unsafe ref access.

Correction:
Move the simulated time offset into the Mock Claim API.
Provide setClockOffset() and getNow() methods.
Remove the problematic ref dependency from ArenaShell.

Fixing commit:
c31c1ba – feat(hw3): integrate claim controls and conflict feedback

Verification:
The user reported that tests, lint and build passed after the fix.

---

**FAILURE 2 – Extra Blank Line at End of JSX**

Related task:
Step 2 – Integrating Sortable PUBG Leaderboard.

Observed error:

src/homeworks/KraftonPubgVnArena/ArenaShell.jsx:107:
new blank line at EOF.

Detected by:
git diff --cached --check

Technical cause:
The AI-generated PowerShell replacement left an unnecessary blank line at the end of ArenaShell.jsx.

Correction:
Normalize the file ending using TrimEnd() followed by a single newline.
Stage the corrected file and repeat the Git whitespace check.

Fixing commit:
40a3a88 – feat(hw3): implement sortable pubg leaderboard

Verification:
The user subsequently committed the corrected Leaderboard implementation successfully.

---

**FAILURE 3 – Missing SEO Metadata and Invalid robots.txt**

Related task:
Step 5 – Lighthouse verification.

Observed evidence:
Initial Lighthouse results:
Performance: 56
Accessibility: 100
Best Practices: 100
SEO: 82

Lighthouse reported:
- Document does not have a meta description.
- robots.txt is not valid.
- robots.txt returned HTML content instead of valid robots directives.

Technical cause:
The project did not contain all required SEO metadata.
The missing robots.txt resource was served through the application's HTML fallback.

Correction:
Add a meta description in index.html.
Create public/robots.txt with valid crawler directives.
Verify using the production build instead of relying only on Vite development mode.

Fixing commit:
0f21f25 – fix(hw3): improve production seo metadata

Verification:
The user reported Lighthouse scores of 100 for Performance, Accessibility, Best Practices and SEO after production verification and the fixes.

---

**AUDIT SUMMARY**

Observed failures documented: 3

1. React implementation and lint failure.
2. Git formatting failure.
3. SEO configuration failure detected by Lighthouse.

All three occurred during the real HW3 workflow.
The listed commits contain the corrected implementations.

The first two commits contain the corrections together with their associated feature work. They are not standalone bug-fix commits.

Lighthouse scores are reported from user verification.
These results do not establish complete WCAG 2.2 AA conformance.

No hypothetical failures or fabricated test results are included.
