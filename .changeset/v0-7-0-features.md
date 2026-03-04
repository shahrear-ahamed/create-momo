---
"create-momo": minor
---

- **Smart In-Place Adoption**: `pnpm create momo .` now detects existing projects and migrates them into the Momo ecosystem.
- **Dependency Management**: Added `momo update` for interactive workspace-wide dependency upgrades.
- **Safe Renaming**: Added `momo rename` to safely update package names and all internal workspace references.
- **Dynamic Versioning**: Blueprints now automatically inject the current CLI version into scaffolded projects.
- **Global Synchronization**: Updated 20+ templates to the latest stable versions of React, Next.js, TanStack Start, Express, and more.
- **Performance & Stability**: Switched to `tinyglobby` for faster, more reliable workspace scanning and fixed ESM bundling issues.
