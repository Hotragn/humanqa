# Keyboard-gate example

## Prompt

> Gate the local project-creation journey for critical axe violations and keyboard reachability of `#create-project`.

## Output

```json
{
  "decision": "block",
  "routes": ["http://127.0.0.1:4173/projects/new"],
  "axe": {
    "completed": true,
    "rule_ids": ["label"],
    "finding_ids": ["HQ-AX-EXAMPLE1"]
  },
  "keyboard": {
    "checks": 1,
    "blocked_targets": ["#create-project"]
  },
  "scope_statement": "Automated axe and bounded keyboard checks cover only the rendered states, routes, browser, and viewport exercised by this run. They do not prove WCAG conformance, legal compliance, screen-reader usability, cognitive accessibility, or the absence of barriers in untested states. Manual testing is required.",
  "manual_review": [
    "Verify logical focus order after the fixture trap is removed.",
    "Test the corrected journey with a screen reader.",
    "Review label clarity, zoom, contrast, and error recovery."
  ]
}
```
