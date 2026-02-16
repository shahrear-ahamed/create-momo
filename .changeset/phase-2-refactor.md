---
"create-momo": minor
---

Refactored the CLI core for better modularity and unified the command structure.
- Unified `add` command with subcommands for apps, packages, and dependencies.
- Integrated Turborepo native features with argument pass-through and filter support.
- Centralized all constants and types in shared modules.
- Added a comprehensive test suite (54 passing tests).
