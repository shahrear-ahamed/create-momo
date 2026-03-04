---
"create-momo": patch
---

This update focuses on improving the developer experience with better Turbo integration and building stability.

- **Global Turbo TUI Support**: Enabled high-fidelity Terminal UI (TUI) dashboard by default for all task execution (`dev`, `build`, `lint`, `test`, `start`).
- **Build Infrastructure Fixes**:
  - Resolved a recursive build loop in blueprints by ensuring root scripts call `turbo` directly.
  - Fixed Next.js workspace module resolution for `@momo/ui` by adding automated `transpilePackages` configuration and correcting source export paths.
- **CLI & Task Enhancements**:
  - Improved `momo graph` to output valid DOT format using `turbo build --graph`.
  - Added default `start` and `test` tasks to all project templates.
  - Supported passing arbitrary flags through the CLI to the underlying Turbo engine.
