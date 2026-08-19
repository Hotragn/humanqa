# HumanQA concept scorecard

Date: 2026-08-18

These scores are explicit assumptions, not objective truth. They are useful only because they expose what the team currently believes and what validation could overturn. Each input is scored from 1 (weak) to 5 (strong), except privacy/safety complexity, where 1 means simple and 5 means complex.

The requested formula does not include developer willingness as a term, so willingness is recorded for comparison but not silently added to the total:

```text
concept_score =
  urgency * 1.5 +
  demo_strength * 1.5 +
  differentiation * 1.5 +
  feasibility * 1.25 +
  evidence_reliability * 1.25 +
  star_potential * 1.0 +
  contribution_potential * 1.0 +
  expansion_potential * 0.75 +
  founder_fit * 0.75 -
  privacy_safety_complexity * 1.0
```

## Scores

| Rank | Concept        | Urgency | Willingness | Demo | Diff. | Feasible | Evidence | Stars | Contrib. | Expansion | Privacy complexity | Founder fit |     Score |
| ---: | -------------- | ------: | ----------: | ---: | ----: | -------: | -------: | ----: | -------: | --------: | -----------------: | ----------: | --------: |
|    1 | Proofrun       |       5 |           5 |    5 |     4 |        4 |        5 |     5 |        5 |         5 |                  3 |           5 | **46.75** |
|    2 | Keypath        |       5 |           5 |    5 |     4 |        4 |        5 |     4 |        5 |         4 |                  2 |           4 | **45.25** |
|    3 | QualitySkill   |       4 |           4 |    5 |     4 |        4 |        3 |     5 |        5 |         5 |                  3 |           5 | **42.75** |
|    3 | ReproForge     |       4 |           4 |    5 |     4 |        5 |        4 |     5 |        4 |         4 |                  3 |           4 | **42.75** |
|    5 | ContractBridge |       5 |           4 |    4 |     5 |        3 |        4 |     4 |        4 |         5 |                  3 |           5 | **42.25** |
|    6 | Deadman Switch |       4 |           4 |    5 |     5 |        3 |        4 |     5 |        5 |         4 |                  5 |           4 | **40.75** |
|    7 | RiskCanvas     |       4 |           4 |    4 |     4 |        4 |        4 |     4 |        4 |         5 |                  3 |           5 | **40.50** |
|    8 | Pack Commons   |       3 |           4 |    4 |     4 |        4 |        4 |     5 |        5 |         5 |                  3 |           4 | **40.25** |
|    8 | ReviewTrail    |       5 |           4 |    5 |     4 |        2 |        4 |     5 |        4 |         5 |                  4 |           4 | **40.25** |
|   10 | FrameLedger    |       4 |           4 |    5 |     4 |        3 |        4 |     5 |        4 |         4 |                  4 |           5 | **40.00** |
|   11 | MergeGate      |       5 |           4 |    5 |     3 |        3 |        5 |     4 |        4 |         4 |                  4 |           4 | **39.50** |
|   12 | FrictionProbe  |       3 |           3 |    4 |     4 |        3 |        2 |     4 |        4 |         4 |                  4 |           5 | **33.50** |

## Why the top concepts scored well

### Proofrun

Proofrun has the strongest complete loop: a declared journey produces evidence, deterministic findings, a verdict, and reusable code. It demonstrates the broader HumanQA mission without depending on CI permissions, autonomous exploration, or a model. Its largest risk is noise from UX-flavored heuristics, so v0.1 must emphasize indisputable signals such as failed requests, unlabeled controls, missing accessible names, horizontal overflow, broken navigation, console errors, and bounded keyboard failures.

### Keypath

Keypath is the strongest backup because it targets a specific scanner gap and has unusually credible evidence. It is narrower than the full mission and could become the primary direction if mixed quality reports prove confusing or if engineers value keyboard-path evidence more than general release scoring.

### QualitySkill and ReproForge

Both have excellent demos and contribution surfaces. Neither should lead: QualitySkill risks becoming a prompt collection, while ReproForge needs high-quality upstream evidence. They work best as outputs of the selected engine.

## Selection

### Primary v0.1: HumanQA Proofrun

Keep the **HumanQA** name and mission, but narrow the first release to:

> A local CLI that executes one declared, safe Playwright journey and turns deterministic browser and accessibility evidence into a report, release verdict, and regression-test scaffold.

The public product language should say “declared journeys” prominently. It should not imply reliable autonomous understanding of an arbitrary web application.

### Backup: Keypath

If the multi-category report is too broad or noisy, narrow to journey-level accessibility and keyboard evidence. The same collector, finding model, reporter, and generated-test pipeline remain useful, so this is a low-waste fallback.

### Promising modules to postpone

1. **ContractBridge:** Keep the quality-contract schema and acceptance matrix, but postpone natural-language criterion interpretation. In v0.1, criteria map explicitly to journey assertions or remain `review`.
2. **ReproForge for arbitrary issues:** Generate tests only from validated HumanQA findings. Arbitrary issue-text interpretation belongs after evidence sufficiency can be measured.

### Directions explicitly rejected for v0.1

1. **FrictionProbe as automated user research:** Automation cannot provide evidence about human attitudes, comprehension, or preference. It may generate research questions later, but it cannot substitute for participants.
2. **RiskCanvas as a standalone dashboard:** Aggregation before trusted inputs would create presentation without proof and could make subjective scores look objective.
3. **MergeGate as the first product:** CI onboarding, artifact retention, and false-gate costs would slow learning. A local dry run and example workflow are sufficient until report stability is demonstrated.

## Positioning decision

HumanQA remains the chosen direction, with a sharper boundary:

- **Retain:** evidence-first, local-first, quality contracts, deterministic checks, accessibility, transparent scoring, report generation, safe test scaffolds, packs, and portable skills.
- **Narrow:** require declared journeys for strong claims; conservative goal exploration may inspect one page but cannot claim journey completion.
- **Postpone:** hosted dashboards, autonomous authenticated exploration, automatic issue or pull-request creation, full visual diffing, and broad integrations.
- **Rename internally:** use “Proofrun” as the v0.1 wedge and demo narrative, not as a replacement repository name.

## Evidence that could reverse the decision

The primary selection should change if any of these occur in early tests:

- Fewer than 6 of 10 target users can explain the report verdict and cite its evidence after a five-minute trial.
- More than 20% of deterministic findings are judged non-actionable across seeded and real staging journeys.
- A generated test takes longer to review and repair than writing the same test from scratch.
- Keypath alone produces materially higher install-to-second-run conversion than the general Proofrun flow.
