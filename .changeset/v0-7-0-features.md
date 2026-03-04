---
"create-momo": minor
---

- **Smart In-Place Adoption**: `pnpm create momo .` now intelligently handles existing projects (single apps or monorepos) and migrates them into the Momo ecosystem.
- **`momo update`**: Added an interactive workspace-wide dependency manager to keep your monorepo up-to-date with a single command.
- **Enhanced `momo rename`**: Safely rename any workspace package. Now including **automatic source-code refactoring** (imports/references) in `.ts`, `.tsx`, `.js`, and `.jsx` files.
- **Dynamic Version Injection**: Scaffolding now automatically injects the current CLI version into new projects via the `{{momoVersion}}` template variable.
- **Global Template Synchronization**: Upgraded 20+ blueprints and component templates to the latest stable versions (Next.js 16.1.6, React 19.2.4, TailwindCSS 4.2.1, TanStack Start 1.120.20, etc.).
- **ESM Stability**: Switched to `tinyglobby` to resolve bundling issues with file pattern matching in ESM environments.
- **UX Refactoring**: Optimized the CLI to only show the ASCII logo during creation/adoption flows, ensuring clean output for management tasks and full Turbo TUI compatibility.
