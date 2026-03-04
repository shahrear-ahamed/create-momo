# create-momo

## 0.7.0

### Minor Changes

- db67fd5: # v0.7.0 Release: Smart Lifecycle & Workspace Refactoring

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

## 0.6.1

### Patch Changes

- 26ef2e4: This update focuses on improving the developer experience with better Turbo integration and building stability.
  - **Global Turbo TUI Support**: Enabled high-fidelity Terminal UI (TUI) dashboard by default for all task execution (`dev`, `build`, `lint`, `test`, `start`).
  - **Build Infrastructure Fixes**:
    - Resolved a recursive build loop in blueprints by ensuring root scripts call `turbo` directly.
    - Fixed Next.js workspace module resolution for `@momo/ui` by adding automated `transpilePackages` configuration and correcting source export paths.
  - **CLI & Task Enhancements**:
    - Improved `momo graph` to output valid DOT format using `turbo build --graph`.
    - Added default `start` and `test` tasks to all project templates.
    - Supported passing arbitrary flags through the CLI to the underlying Turbo engine.

## 0.6.0

### Minor Changes

- 78e93c8: # Momo 0.6.0: Template Migration & CLI Polish
  - **Template Migration**: Moved all blueprints and components to `packages/create-momo/templates` for better distribution and modularity.
  - **CLI Polish**:
    - Added `-n, --name` flag to `momo add` for explicit workspace naming.
    - Improved `momo add` logic with "Smart Routing" (auto-detecting target directory based on metadata).
    - Enhanced `momo install` with better workspace protocol handling and target awareness.
    - Refined `--help` outputs and updated the CLI logo for a more premium look.
  - **Recent Improvements & Commit History**:
    - `chore: formatting fixes and template migration verification`
    - `docs: sync readme and roadmap with momo 2.0 (v0.6.0) refactor & cli consistency`
    - `fix: command duplication crash and syntax error in add.ts`
    - `fix: final oxlint warning`
    - `fix: remove unused catch parameters for oxlint`
    - `fix: address oxlint warnings for pre-push`
    - `fix: lint and formatting issues`
    - `feat: Momo 2.0 CLI Refactor - Unified Command Hierarchy, Smart Routing, Shadcn & External Frameworks`
    - `feat: release v0.6.0 - advanced scaffolding, setup automation, and documentation`
    - `chore: industry-standard refactor for all templates and blueprints + OXC migration`
  - **Bug Fixes**:
    - Fixed command duplication crash in `momo add`.
    - Resolved syntax errors in `add.ts`.
    - Fixed formatting issues in test files discovered during pre-push checks.
  - **Project Structure**: Consolidated documentation and synced `README.md` and `ROADMAP.md` with Momo 2.0 standards.

## 0.5.1

### Patch Changes

- 2cf4e77: - **Documentation**: Updated README files with new management commands (`clean`, `test`, `graph`, `login`).
  - **Stability**: Standardized error logging across the CLI for more meaningful and graceful feedback.
  - **Fix**: Resolved unit test regressions in the command constant suite.

## 0.5.0

### Minor Changes

- cc09c9f: - **Modularized CLI Core**: Extracted logo and package information into shared utilities for better maintainability.
  - **Turborepo Remote Cache**: Added `momo login`, `momo logout`, `momo link`, and `momo unlink` commands.
  - **Project Management**: Added `momo clean` for workspace cleanup and `momo test` as a Turbo wrapper.
  - **Dependency Graph**: Added `momo graph` to visualize the project dependency graph.
  - **Code Quality**: Standardized all command constants and expanded unit test coverage to 61 passing tests.
  - **Refactor**: Flattened management commands to top-level for better accessibility.

## 0.4.2

### Patch Changes

- cfdf059: Fix CLI argument parsing for `pnpm create momo <name>` and `pnpm create momo .`. Modularized the CLI into separate `create-momo` (scaffolding) and `momo` (management) binaries.

## 0.4.2

### Patch Changes

- Fix CLI argument parsing for `pnpm create momo <name>` and `pnpm create momo .`. Modularized the CLI into separate `create-momo` (scaffolding) and `momo` (management) binaries.

## 0.4.2

### Patch Changes

- Fix CLI argument parsing for `pnpm create momo <name>` and `pnpm create momo .`. Modularized the CLI into separate `create-momo` (scaffolding) and `momo` (management) binaries.

## 0.4.1

### Patch Changes

- 7556cf2: Remove `momo init` command and unify the CLI entry point. `create-momo <name>` now routes directly to project creation via binary name detection. Running `momo` alone outside a project launches the creation wizard; inside a project it shows the help menu.

## 0.4.0

### Minor Changes

- 0b27fde: Refine add command logic with standardized action flags (-a, -p, -d) and non-interactive `--flavor` support. Fix Turbo integration by detecting specific package manager versions and improving the runTurbo wrapper. Enhance CLI UX with default help display, improved config usage strings, and "Coming Soon" placeholders for future features (deploy, setup, update).

## 0.3.0

### Minor Changes

- b5c265f: Refactored the CLI core for better modularity and unified the command structure.
  - Unified `add` command with subcommands for apps, packages, and dependencies.
  - Integrated Turborepo native features with argument pass-through and filter support.
  - Centralized all constants and types in shared modules.
  - Added a comprehensive test suite (54 passing tests).

## 0.2.0

### Minor Changes

- c0b44f6: feat: transform into a context-aware monorepo manager with `dev`, `build`, `lint`, and `start` commands. Added safety checks to prevent nested monorepos and streamlined the creation flow.

## 0.1.0

### Minor Changes

- e5d665e: Initial release of `create-momo`, a modern CLI tool for scaffolding and managing monorepo projects.

  Key features included in this release:
  - **Project Scaffolding**: Quick initialization of Turborepo-based monorepo projects.
  - **Component Management**: Interactive `add` command to scaffold applications in `/apps` and packages in `/packages` with appropriate TypeScript configurations.
  - **Modern CLI UI**: A vibrant, user-friendly interface featuring top-to-bottom gradients and interactive prompts powered by `@clack/prompts`.
  - **Built-in Workflows**:
    - `setup`: Automated configuration for npm publishing, open-source documentation (LICENSE, CONTRIBUTING), and proprietary project settings.
    - `deploy`: Initial deployment hooks and `push` shortcut.
    - `config`: Global and project-level configuration management.
  - **Utility Tools**:
    - `doctor`: Health checks for project dependencies and environment.
    - `list`: Browse available component flavors and blueprints.
  - **CI/CD Integration**: Robust GitHub Actions workflows for continuous integration (`ci.yml`), official releases (`release.yml`), and preview/snapshot releases (`snapshot.yml`).
