# HumanQA demo dashboard

This local Vite application is a deterministic audit fixture, not a production service. It contains signup, simulated login, onboarding, project creation, dashboard empty state, settings, an accessible reference page, and paired broken/fixed behavior.

```bash
pnpm demo          # broken mode at http://127.0.0.1:4173
pnpm --filter @humanqa/demo-dashboard dev:fixed
```

Broken mode seeds an unlabeled field, keyboard loop, horizontal overflow, failed request, missing success feedback, generic calls to action, missing error/empty/loading signals, unsafe action affordance, and broken link. Fixed mode supplies deterministic counterparts. No fixture data is persisted or transmitted.
