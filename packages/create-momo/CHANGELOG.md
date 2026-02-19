# create-momo

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
