# Use Case Guide for Accessibility Teams

## The Problem You're Solving

Automated accessibility testing is broken:
- axe-core catches rule violations but not **user impact** or **reach**
- Manual accessibility audits don't scale to CI/CD pipelines
- No connection between **what users can't do** and **what needs fixing**
- Inaccessible releases happen because accessibility findings get deprioritized vs. feature bugs

**HumanQA changes this by running accessibility checks on real user journeys.**

---

## What HumanQA Does for Accessibility

### 1. Journey-Scoped Accessibility Evidence
Don't scan arbitrary pages. Run accessibility checks on **real user journeys**:

```yaml
quality_contracts:
  - id: signup-accessible
    name: Signup flow is keyboard navigable
    journey: packs/journeys/saas-signup.yaml
    acceptance_criteria:
      - All interactive controls are keyboard reachable
      - No critical WCAG violations on any step
      - Focus indicator is always visible
    thresholds:
      max_critical_findings: 0
```

HumanQA runs this journey and checks:
- ✅ **Keyboard navigation** (Tab, Enter, Escape through each step)
- ✅ **axe violations** (WCAG-tagged, with remediation links)
- ✅ **Form labels** (all inputs have associated labels or aria-label)
- ✅ **Semantic HTML** (headings, landmarks, roles)
- ✅ **Focus visibility** (focus indicator present and visible)
- ✅ **Focus traps** (can you escape modal/dropdown?)

### 2. Findings That Drive Action
Instead of "154 violations detected," you get:

```json
{
  "id": "HQ-AX-001",
  "title": "Email input missing label",
  "category": "accessibility",
  "severity": "high",
  "wcagLevel": "A",
  "wcagCriteria": "1.3.1 Info and Relationships",
  "userImpact": "Screen reader users don't know what this field is for.",
  "reproductionSteps": [
    "Open signup page",
    "Listen to screen reader (NVDA, JAWS, VoiceOver)",
    "Focus email field → no label announced"
  ],
  "evidence": {
    "selector": "[data-testid='email-input']",
    "dom": "<input type='email' value=''>",
    "screenshot": "artifacts/signup-email-unlabeled.png",
    "browserTrace": "artifacts/signup-email-unlabeled.trace.zip"
  },
  "priorityScore": 8.5,
  "reach": "100%",
  "impact": 9,
  "effort": 1,
  "suggestedRemediation": "Add <label for='email-input'>Email address</label> or aria-label='Email address'",
  "wcagLink": "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html"
}
```

**Every finding includes:**
- WCAG criterion + level (not just "axe rule violation")
- Real user impact (not technical jargon)
- Exact DOM + screenshot + trace
- Step-by-step reproduction
- How to fix it with examples
- Reach × Impact ÷ Effort scoring

### 3. Keyboard Testing Without Manual Tab-Through
Define a persona for keyboard-only users:

```yaml
kind: persona
id: keyboard-only-user
name: Keyboard-Only User
description: A user who navigates using only Tab, Enter, Escape, and arrow keys
definition:
  evidence_focus: [focus-order, focus-visibility, keyboard-traps, tab-index]
```

HumanQA automatically:
- Navigates the entire journey using **only keyboard** (no mouse)
- Detects focus traps and missing focus indicators
- Flags ambiguous button labels ("Click here" vs "Create project")
- Validates focus order makes logical sense
- Checks for misuse of tabindex

**No manual tab-through needed. No video recording. Just evidence.**

### 4. Accessibility Metrics That Scale
Get trending data across releases:

```
Sprint  Critical  High   A11y Score  Keyboard Pass  Trend
v0.5.0    12      45      68%        ✅              —
v0.6.0     8      32      76%        ✅              ↑
v0.7.0     2      18      89%        ✅              ↑
v0.8.0     0       8      95%        ✅              ↑
```

Track improvement sprint-over-sprint. Celebrate wins. Maintain accountability.

---

## For Different Accessibility Roles

### Accessibility Leads
- **Set quality gates:** "No critical WCAG violations in signup flow before release"
- **Define standards:** Create custom personas for your org (e.g., "WCAG 2.1 AA strict mode")
- **Track metrics:** Dashboard shows accessibility score trending
- **Build packs:** Define org-wide accessibility requirements as reusable data

**What you'll do:**
```bash
# Define your org's standards
cat > packs/personas/wcag-2.1-aa.yaml <<EOF
kind: persona
id: wcag-2.1-aa
name: WCAG 2.1 Level AA
definition:
  evidence_focus: [wcag-a, wcag-aa, keyboard, color-contrast]
EOF

# Set release gates
humanqa verify --config humanqa.yml --min-a11y-score 95
```

### QA with Accessibility Focus
- **Extend journeys:** Add keyboard navigation checks to existing user flows
- **Validate rules:** Run the demo, see evidence firsthand
- **Contribute personas:** Add "screen-reader-user," "motor-impairment," "cognitive-disability" personas
- **Review findings:** Use reports to document issues in your tracking system

**What you'll do:**
```bash
# Extend an existing journey with accessibility focus
humanqa verify packs/journeys/checkout.yaml \
  --persona keyboard-only-user \
  --persona screen-reader-user
```

### Developers
- **Fix with evidence:** Every issue includes exact DOM + screenshot + trace
- **Understand context:** See the actual user journey where accessibility broke
- **Regression prevent:** Generated Playwright tests prevent re-breaking same issue

**What you'll do:**
```bash
# See exact reproduction steps
humanqa report artifacts/signup-email-unlabeled.trace.zip

# Open DevTools trace to see exact state
# Fix the DOM
# Re-run to verify
humanqa verify packs/journeys/saas-signup.yaml
```

---

## What HumanQA Does NOT Do

Be honest about scope:
- ❌ **Screen-reader compatibility testing** — checks for semantic HTML + labels, not real AT behavior
- ❌ **Visual contrast validation** — would need visual scanning (roadmap: v0.3)
- ❌ **Color-blind simulation** — tools like Sim Daltonism do this better
- ❌ **User research with people who have disabilities** — no substitute for real users
- ❌ **WCAG 2.1 conformance audits** — this is a regression gate, not a compliance audit

**It does augment these** by catching accessibility regressions between releases.

---

## ROI for Accessibility Teams

| Metric | Before | After |
|--------|--------|-------|
| **Time to find accessibility regressions** | Manual audit (2-3 days) | Automated (10 minutes) |
| **Journeys audited per release** | 2-3 (manual) | 5-8 (automated) |
| **False positives** | High (manual, subjective) | <5% (deterministic rules) |
| **Developer confidence** | Low ("just test it") | High ("journey gate passed") |
| **Documentation quality** | Scattered (design docs) | Deterministic (every finding has WCAG link + remediation) |
| **Accessibility score visibility** | Low (hidden in audit reports) | High (automated trending + public CI results) |

---

## Getting Started (30 minutes)

### Step 1: Run the Demo (10 min)
```bash
pnpm demo
# In another terminal:
pnpm humanqa audit http://127.0.0.1:4173 \
  --persona keyboard-only-user \
  --goal "Create a project"
```

See real accessibility findings with browser traces and screenshots.

### Step 2: Define Your First Journey (10 min)
```bash
humanqa init --url https://staging.example.com
# Edit the generated journey to match your most critical user flow
```

### Step 3: Set Accessibility Thresholds (10 min)
```yaml
acceptance_criteria:
  - All interactive controls are keyboard reachable
  - No critical WCAG violations
  - All form fields have accessible labels
thresholds:
  max_critical_findings: 0
  min_a11y_score: 90
```

### Step 4: Integrate with CI (5 min)
Every PR gets:
- Keyboard navigation validation
- axe scanning with WCAG tagging
- Screenshot + trace evidence
- A11y score impact

---

## Real Example: Catching a Regression

### Scenario: Form Label Bug

**What happened:**
```html
<!-- Before (accessible) -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- After (broke in v0.6.0) -->
<input type="email" placeholder="Email" />  <!-- label removed! -->
```

### Without HumanQA
- Tester manually scrolls signup page
- Tester opens screen reader
- Takes 15 minutes to notice label is missing
- Bug ships to production
- Complaint from user
- Hotfix needed

### With HumanQA
```bash
humanqa verify --config humanqa.yml
```

**Immediate output:**
```
❌ FAIL: Signup journey
  HQ-AX-001 (CRITICAL): Email input missing label
    WCAG: 1.3.1 Info and Relationships
    Reach: 100% of users
    Impact: User can't identify field
    Remediation: Add <label> or aria-label
    Evidence: artifacts/email-missing-label.png
    Trace: artifacts/email-missing-label.trace.zip

Fix found automatically. Screenshot + trace attached.
```

**Result:** Regression caught in CI, before merge, with exact evidence.

---

## Key Concepts

### Safe Mode + Accessibility
HumanQA's safe mode **prevents mutations** (form submits, deletes, payments) by default. For accessibility testing, this is **good**:
- You're testing the journey as users experience it
- No test data is changed
- Safe to run on staging or production-like environments
- Focus is on **accessibility**, not **functionality**

### Personas = Evidence Weighting
Personas don't change what HumanQA tests. They change **what evidence matters**:

```yaml
# Standard audit: all evidence
humanqa verify signup.yaml

# Keyboard-focused audit: emphasize focus/navigation
humanqa verify signup.yaml --persona keyboard-only-user

# Screen-reader-focused audit: emphasize labels/semantics
humanqa verify signup.yaml --persona screen-reader-user
```

### Evidence Preservation
Every finding includes:
- **Screenshot** — exact page state when issue occurred
- **Trace** — full browser trace (DevTools playback)
- **DOM** — exact HTML that triggered the issue
- **Console** — any errors/warnings
- **Network** — requests (if API response caused it)

Use these to debug and validate fixes.

---

## Questions Your Team Will Ask

**Q: Does it replace manual accessibility audits?**
A: No. Use this for regression detection and release gates. Keep manual audits for new features and conformance reviews.

**Q: Can we add our own accessibility rules?**
A: Yes. Packs are data-only YAML files. Add custom heuristics without touching core code.

**Q: What about false positives?**
A: Deterministic rules have <5% false positive rate. Advisory findings are clearly marked for human review.

**Q: Does it work with dynamic content?**
A: Yes. Waits for elements to appear, handles async rendering, captures full traces.

**Q: What if our app uses custom components?**
A: Add custom personas with accessibility focus. Define what "accessible" means for your components.

---

## Accessibility Scoreboard Example

```yaml
humanqa verify humanqa.yml --report

╔═══════════════════════════════════════╗
║    Accessibility Release Gate         ║
╠═══════════════════════════════════════╣
║ Overall Score: 87%                    ║
║ Trend: ↑ (+3% from last release)      ║
║                                       ║
║ Critical Issues:  0 ✅                 ║
║ High Issues:      3 ⚠️                 ║
║ Medium Issues:   12 ⚠️                 ║
║ Low Issues:      28 ℹ️                 ║
║                                       ║
║ WCAG A: 95%                           ║
║ WCAG AA: 87%                          ║
║ WCAG AAA: 62%                         ║
║                                       ║
║ Keyboard: ✅ PASS                      ║
║ Focus Visible: ✅ PASS                 ║
║ Labels Present: ⚠️ 3 missing           ║
╚═══════════════════════════════════════╝
```

---

## Next Steps

1. Read [docs/safety-and-privacy.md](./safety-and-privacy.md) to understand evidence handling
2. Explore [packs/personas/](../packs/personas/) to see existing personas
3. Join [GitHub Discussions](https://github.com/Hotragn/humanqa/discussions/categories/help-needed) for questions
4. Run `pnpm humanqa doctor` to verify your environment
5. Start with one critical journey (signup, checkout, settings)

**Your feedback on accessibility scope shapes HumanQA's roadmap.** Tell us:
- What accessibility standards matter to your org?
- What false positives waste your time?
- What findings would be most valuable?

---

## Recommended Reading

- [WCAG 2.1 Overview](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components Blog](https://inclusive-components.design/)
- [WebAIM Articles](https://webaim.org/)
- HumanQA [README.md](../README.md)
