# LinkedIn drafts

## 1 — Product and engineering bridge

Most teams already have pieces of product-quality evidence: Playwright tests, screenshots, accessibility scans, console logs, acceptance criteria, and manual QA notes. The gap appears at the release decision. Someone still has to connect product intent to what the browser actually did and explain why a failure matters.

HumanQA is an open-source experiment in that missing layer. A declared, safe journey produces local evidence, deterministic findings, an acceptance matrix, transparent release risk, and a Playwright regression scaffold. It works without a model key, and AI-generated text cannot change raw evidence or release gates.

The first release is intentionally not autonomous. It does not claim to understand an arbitrary application, replace user research, or certify accessibility. I would rather have one reproducible journey than a persuasive but unsupported critique.

The next question is empirical: does this artifact improve a real release conversation? I am recruiting 10 users with one authorized, non-destructive local or staging journey to find out.

## 2 — Accessibility honesty

Automated accessibility results are valuable and incomplete. The uncomfortable failure is not only missing issues; it is presenting a scanner run as if it proved legal or WCAG compliance.

HumanQA treats accessibility as first-class evidence. It preserves raw axe rule IDs, targets, and help links; records bounded keyboard traversal for declared controls; and makes the manual-testing boundary impossible to miss in every report.

That means the output can say “this target was not reached in 30 Tab moves and the sequence cycled here.” It cannot say “the product is accessible.” Screen-reader behavior, logical focus order, cognitive accessibility, zoom, content quality, and untested states still require people.

I would value review from accessibility practitioners who are willing to challenge the fixture, wording, and gate semantics.

## 3 — Open-source product discovery

Open-source repositories often publish architecture but hide the product assumptions behind it. HumanQA includes the opposite: 12 candidate concepts, a weighted scorecard, an assumption map, validation thresholds, experiment templates, and a decision log.

The chosen v0.1 wedge is “Proofrun”: one declared journey becomes an evidence bundle, release verdict, and regression scaffold. A keyboard-first accessibility gate scored close enough to be the planned narrowing path if the broader report proves noisy.

The repository also says when to pivot or stop. Stars are not the decision threshold. First-audit success, finding actionability, evidence comprehension, artifact adoption, repeat use, and safe behavior are.

If the assumptions are wrong, the useful outcome is a smaller, more honest project—not a larger roadmap.

## 4 — Safe automation

The rise of browser agents makes an old QA question urgent: what should automation refuse to do?

HumanQA defaults to local execution and safe browser behavior. It does not purchase, pay, delete, publish, message, upload, change accounts, or mutate real records. Non-loopback form submission is blocked unless a user explicitly enables mutation capability after reviewing the target and journey.

This is not a claim that a text classifier can understand every harmful action. It cannot. Safe mode is defense in depth alongside disposable fixtures, least-privilege accounts, reviewed packs, redaction, no-screenshot mode, offline loopback mode, and human authorization.

Trustworthy automation begins by documenting the boundary where automation stops.

## 5 — Contribution surface

The HumanQA engine is TypeScript, Playwright, axe, Zod, and Vitest. The community surface does not require all of those.

Validated YAML packs let contributors add personas, journeys, heuristic mappings, product frameworks, and industry contexts without modifying core code. Each pack has compatibility, safety constraints, fixture expectations, versioning, and author attribution in reports.

Five portable Agent Skills add a second contribution path. They constrain coding agents to HumanQA evidence, privacy, confidence, and human-review rules instead of shipping a prompt collection with unsupported claims.

The repository starts with 20 fully scoped issues, including eight mentored beginner tasks. The goal is not to inflate issue count. It is to make the first useful contribution legible before someone invests a weekend.
