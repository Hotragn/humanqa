# Expected output shape

A broken local implementation should produce `humanqa-output/<timestamp>/project-creation/` with JSON, Markdown, HTML, SARIF, JUnit, screenshots, and a trace. The console summary follows this shape:

```text
project-creation: Block release (score/100)
Verified 1 quality contract(s). Output: humanqa-output/<timestamp>
```

The numeric score is intentionally not prescribed because it depends on the exact deterministic findings in the adopting application. A fixed implementation should clear the mapped success and keyboard failures; unrelated findings remain visible.
