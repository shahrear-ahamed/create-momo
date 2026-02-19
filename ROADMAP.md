# 🗺️ Create Momo — Version Roadmap

> This document outlines the planned releases, features, and improvements for the **Create Momo** CLI.
> Items are grouped by semantic version type: **Patch**, **Minor**, and **Major**.

---

## 🔧 v0.5.0 — Minor Release (Modularization, Testing & Remote Cache)

Refactor codebase for better maintainability, introduce comprehensive test coverage, and enable Turborepo team features.

### Feature Overview
| Category | Feature | Description |
|:---|:---|:---|
| **DX & Core** | **Shared CLI Core** | Extract logo, colors, and common CLI setup to a modular utility. |
| | **Code Cleanup** | Remove duplicate logic in `index.ts` and `momo.ts`. |
| **Testing** | **Unit Testing** | Implement Vitest suite for validators, project utils, and template logic. |
| | **Integration Testing** | Add tests for the `create-momo` scaffolding flow. |
| **Remote Cache** | `momo login/logout` | Authenticate with Turborepo Remote Cache (Vercel). |
| | `momo link/unlink` | Link/unlink project to Vercel team/scope. |
| **Management** | `momo clean` | Remove `node_modules`, `dist`, and `.turbo` cache across workspace. |
| | `momo test` | Turbo wrapper for `turbo test` with `--filter` support. |

---

## 🎨 v0.6.0 — Minor Release (Templates & Scaffolding Enhancements)

Expand the scaffolding system with richer templates and configuration options.

| Feature | Description |
|:---|:---|
| **Premium App Blueprints** | Add `--flavor saas`, `--flavor ecommerce`, `--flavor dashboard` for pre-wired app templates with auth, DB, and API routes. |
| **Package Templates** | Add `--flavor ui-library`, `--flavor shared-utils`, `--flavor api-client` for common internal package patterns. |
| **Template Registry** | Allow users to register custom templates via `momo config set templates.custom /path/to/template`. |
| **`momo add config`** | Scaffold shared configuration packages (ESLint, Prettier, Biome, Tailwind) into `packages/`. |
| **`momo list --remote`** | Fetch and display available templates from a remote registry (future). |

---

## ⚙️ v0.7.0 — Minor Release (Config, Project Lifecycle & Adoption)

Tools for managing existing projects over time and adopting Momo in pre-existing monorepos.

| Command | Description |
|:---|:---|
| `momo adopt` | **Integrate Momo into an existing project.** Detects the current monorepo structure (Turborepo, Lerna, Nx, or vanilla workspaces), injects `momo.config.json`, sets up the `momo` binary, adds shared configs, and wires up Turbo pipeline tasks — all without overwriting existing files. |
| `momo update` | Sync local shared configs (TypeScript, Biome, etc.) with the latest Momo blueprints. Detect drift and offer to merge or overwrite. |
| `momo remove <name>` | Safely remove an app or package from the workspace. Removes the directory, updates `pnpm-workspace.yaml`, and cleans up cross-references. |
| `momo rename <old> <new>` | Rename a workspace package. Updates `package.json`, import paths, and `turbo.json` references. |
| `momo setup publish` | Configure npm publishing: set up `.npmrc`, `publishConfig`, changesets, and CI release workflow. |
| `momo setup open-source` | Add `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and issue/PR templates. |

### 🔄 `momo adopt` — Detailed Workflow

> For teams with existing monorepos who want Momo's management commands without starting over.

| Step | What It Does |
|:---|:---|
| **1. Detect project type** | Scan for `turbo.json`, `lerna.json`, `nx.json`, `pnpm-workspace.yaml`, or `workspaces` in `package.json`. |
| **2. Detect package manager** | Read `packageManager` field or detect lockfile type. |
| **3. Inject `momo.config.json`** | Create the config file with detected scope, manager, and workspace structure. |
| **4. Add `create-momo` as a dev dep** | Run `pnpm add -Dw create-momo` (or equivalent) to make `momo` binary available. |
| **5. Wire Turbo pipelines** | If `turbo.json` exists, validate that `build`, `dev`, `lint` tasks are defined. Offer to add missing ones. |
| **6. Add shared configs** | Optionally scaffold `packages/config-typescript` with base TS configs. |
| **7. Verify** | Run `momo doctor` to confirm the project is healthy under Momo management. |

```bash
# Example usage
cd ~/existing-monorepo
momo adopt                    # Interactive mode — detects and asks
momo adopt --skip-configs     # Skip shared config scaffolding
momo adopt --force            # Overwrite existing momo.config.json
```

---

## 🚀 v1.0.0 — Major Release (Deployment, Blueprints & Package Manager Migration)

The full-featured, production-ready release.

### Unified Deployment

| Command | Description |
|:---|:---|
| `momo deploy init` | Auto-detect deployment platform (Vercel, Netlify, Railway, Fly.io) and generate platform-specific config files. |
| `momo deploy push` | Build → verify environment → deploy to target. Uses platform APIs or CLI wrappers. |
| `momo deploy status` | Check deployment status and preview URLs. |

### Premium Blueprints

| Blueprint | Description |
|:---|:---|
| `momo init --blueprint saas` | Full SaaS starter: Next.js app + API + auth + DB + shared UI. |
| `momo init --blueprint ecommerce` | E-commerce: Storefront + admin dashboard + payment SDK package. |
| `momo init --blueprint api-suite` | API-first: Multiple Express/Fastify services + shared validation + OpenAPI. |

### 🔄 Package Manager Migration (`momo migrate`)

> **Feasibility**: ✅ This is achievable. Tools like `corepack` already abstract package managers. The migration involves file transformations, not runtime changes.

| Step | What It Does |
|:---|:---|
| **1. Detect current manager** | Read `packageManager` field from root `package.json` and detect lockfile type. |
| **2. Generate new lockfile** | Delete old lockfile (`package-lock.json` / `yarn.lock`), run `pnpm install` to generate `pnpm-lock.yaml`. |
| **3. Update workspace config** | Convert `workspaces` field in `package.json` to `pnpm-workspace.yaml` (or vice versa). |
| **4. Update `packageManager` field** | Set the exact version string (e.g., `pnpm@9.1.0`). |
| **5. Update scripts** | Replace `npm run` / `yarn` references in scripts with `pnpm`. |
| **6. Update CI/CD** | Detect GitHub Actions workflows and update `setup-node` / install steps. |
| **7. Update `momo.config.json`** | Set the new `manager` field. |

```bash
# Example usage
momo migrate --to pnpm    # Convert from npm/yarn → pnpm
momo migrate --to yarn    # Convert from npm/pnpm → yarn
momo migrate --to bun     # Convert to bun workspaces
```

> [!WARNING]
> **Breaking Change**: Package manager migration may cause subtle dependency resolution differences. The `migrate` command should always create a backup branch before proceeding and run `momo doctor` after completion.

---

## 💡 Suggestions & Ideas (Backlog)

Features that would enhance the CLI but are not yet prioritized. Community feedback will drive scheduling.

### 🔴 High Priority
| Idea | Description |
|:---|:---|
| **`momo graph`** | Visualize workspace dependency graph. Wraps `turbo graph` and opens an interactive SVG/HTML viewer. |
| **`momo ci`** | Generate GitHub Actions / GitLab CI templates pre-configured for the monorepo (build, test, deploy per-workspace). |
| **`momo env`** | Manage `.env` files across workspaces. Share common vars, scope secrets per-app. |

### 🟡 Medium Priority
| Idea | Description |
|:---|:---|
| **`momo eject`** | Remove all Momo abstractions and leave a raw Turborepo. For teams that outgrow the CLI. |
| **`momo diff`** | Show which workspaces have changed since last release (uses `turbo --filter=...[origin/main]`). |
| **`momo release`** | Unified release workflow: changeset → version → publish → git tag → GitHub release. |
| **Plugin System** | Allow third-party `momo-plugin-*` packages to register custom commands and templates. |

### 🟢 Low Priority
| Idea | Description |
|:---|:---|
| **`momo telemetry`** | Opt-in anonymous usage analytics for understanding which features are used. |
| **`momo upgrade`** | Self-update the CLI to the latest version. |
| **Interactive Dashboard** | `momo dashboard` — TUI (terminal UI) with live build status, dependency graph, and workspace overview. |
| **VS Code Extension** | GUI for common `momo` commands, workspace visualization, and integrated terminal. |

---

## 📊 Release Timeline (Tentative)

```mermaid
gantt
    title Create Momo Release Plan
    dateFormat YYYY-MM
    section Patch
        v0.4.1 Bug Fixes & UX     :active, p1, 2026-02
    section Minor
        v0.5.0 Remote Cache & Auth :m1, 2026-02
        v0.6.0 Templates           :m2, 2026-03
        v0.7.0 Project Lifecycle   :m3, 2026-03
    section Major
        v1.0.0 Deployment & Migration :maj1, 2026-04
```

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
