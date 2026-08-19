# Next.js SaaS example

This configuration demonstrates how a local SaaS project can adopt the starter project-creation contract. Adapt route paths and selectors to the application before using it.

```bash
pnpm humanqa verify --config examples/nextjs-saas/humanqa.yml
```

Expected artifacts are documented in [expected-output.md](expected-output.md). The generated scaffold in [project-slug-accessible-name.spec.ts](project-slug-accessible-name.spec.ts) shows the review standard for evidence-derived tests.

Keep fixture data disposable. Do not point the starter journey at a production account that persists project records.
