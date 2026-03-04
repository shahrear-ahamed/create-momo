---
"create-momo": minor
---

# v0.7.0 Release: Smart Lifecycle & Workspace Refactoring

This release introduces significant enhancements to the project lifecycle, including intelligent project adoption, automated workspace-wide updates, and safe package renaming with source code refactoring.

### ✨ Highlights

- **Smart In-Place Adoption**: `pnpm create momo .` now intelligently detects existing project structures (single-repo or monorepo) and migrates them into the Momo ecosystem, injecting essential configurations like `momo.config.json` and `turbo.json`.
- **`momo update` Command**: A new interactive tool to manage workspace dependencies. Check for outdated packages across all apps and packages and update them with a single command. Supports `--check`, `--all`, and `--filter` flags.
- **Enhanced `momo rename`**: Safely rename any package in your monorepo. This now includes **automatic source code refactoring**, recursively updating imports and references in `.ts`, `.tsx`, `.js`, and `.jsx` files to ensure builds remain green.
- **Dynamic Version Injection**: Blueprints now use the `{{momoVersion}}` placeholder to ensure scaffolded projects are pinned to the correct CLI version.
- **Global Template Sync**: Synchronized all 20+ blueprints and component templates to the latest stable versions of Next.js (16.1.6), React (19.2.4), TailwindCSS (4.2.1), and other core tools.

### 🛡️ Quality & DX

- **Zero-Warning Codebase**: Fully optimized with `oxlint` and `oxfmt`. Resolved all linting warnings and achieved 100% formatting compliance across the workspace.
- **UX Refactoring**: The ASCII logo is now exclusively shown during project creation and adoption flows, providing a cleaner experience for management commands and better compatibility with the Turborepo TUI.
- **ESM Stability**: Switched to `tinyglobby` to resolve pattern-matching issues in ESM environments.
- **Bug Fixes**: Resolved issues with `momo add` flag detection, fixed missing configurations in the SaaS blueprint, and stabilized version fallback logic.
