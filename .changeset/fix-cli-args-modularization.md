---
"create-momo": patch
---

Fix CLI argument parsing for `pnpm create momo <name>` and `pnpm create momo .`. Modularized the CLI into separate `create-momo` (scaffolding) and `momo` (management) binaries.
