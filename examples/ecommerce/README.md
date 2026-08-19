# Ecommerce example

This safe-by-default example ends at checkout review. It does not enter payment data, place orders, reserve inventory, submit addresses, or message sellers.

```bash
pnpm humanqa verify --config examples/ecommerce/humanqa.yml
```

Adapt the fixture button name, product selector, review route, and total selector before running. Use disposable local cart state. See [expected-output.md](expected-output.md) for the artifact contract.
