# 🗺️ Create Momo — Version Roadmap

> This document outlines the planned releases, features, and improvements for the **Create Momo** CLI.
> Items are grouped by semantic version type: **Patch**, **Minor**, and **Major**.

---

## ✅ v0.5.0 — Minor Release (Modularization, Testing & OXC Migration)

Refactor codebase for better maintainability, introduce comprehensive test coverage, and migrate to OXC (oxlint & oxfmt).

### Feature Overview

| Category         | Feature                 | Description                                                               |
| :--------------- | :---------------------- | :------------------------------------------------------------------------ |
| **DX & Core**    | **Shared CLI Core**     | Extract logo, colors, and common CLI setup to a modular utility.          |
|                  | **Code Cleanup**        | Remove duplicate logic in `index.ts` and `momo.ts`.                       |
| **Testing**      | **Unit Testing**        | Implement Vitest suite for validators, project utils, and template logic. |
|                  | **Integration Testing** | Add tests for the `create-momo` scaffolding flow.                         |
| **Remote Cache** | `momo login/logout`     | Authenticate with Turborepo Remote Cache (Vercel).                        |
|                  | `momo link/unlink`      | Link/unlink project to Vercel team/scope.                                 |
| **Management**   | `momo clean`            | Remove `node_modules`, `dist`, and `.turbo` cache across workspace.       |
|                  | `momo test`             | Turbo wrapper for `turbo test` with `--filter` support.                   |
| **OXC**          | **OXC Migration**       | Full migration to `oxlint` and `oxfmt` across project and templates.      |

---

## 🛡️ v0.6.0 — Minor Release (Momo 2.0 Refactor) ⚡️

Current focus: Major architectural refactor to provide a unified command hierarchy, smart scaffolding, and native UI component integration.

### Feature Overview

| Category           | Feature                  | Description                                                                  |
| :----------------- | :----------------------- | :--------------------------------------------------------------------------- |
| **CLI Design**     | **Unified Hierarchy**    | Logical command structure: `add`, `install`, `run`, `setup`.                 |
| **Scaffolding**    | **Smart Routing**        | Automatically detects App vs Package targets using `momo.json`.              |
|                    | **Universal Frameworks** | Scaffold any framework (`svelte`, `nest`, etc.) via `pnpm create` fallbacks. |
|                    | **`momo add config`**    | Scaffold shared configs (`oxc`, `typescript`, `tailwind`, `vitest`).         |
| **UI Integration** | **Shadcn UI Protocol**   | Native `shadcn:` protocol support via `momo install`.                        |
| **Dependencies**   | **Smart Install**        | Intelligent `momo install` with workspace protocol detection.                |
| **Utility**        | **`momo doctor`**        | Health and standards audit for monorepo projects.                            |
|                    | **`momo list --remote`** | Fetch and list remote templates from the official repository.                |

### Status

- [x] Implement Unified Command Hierarchy (Momo 2.0).
- [x] Implement Smart Routing logic (Apps vs Packages).
- [x] Implement Universal Framework fallbacks (Astro, Svelte, etc.).
- [x] Implement `shadcn:` protocol for component injection.
- [x] Implement `momo setup ci` (GitHub, GitLab, CircleCI).
- [x] Implement `momo setup env` (T3 Env scaffolding).
- [x] Add functional `momo doctor` and `momo list --remote`.

---

## ⚙️ v0.7.0 — Minor Release (Project Lifecycle & Adoption)

Tools for managing existing projects over time and adopting Momo in pre-existing monorepos.

| Command                   | Description                                                                                                               |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| `momo adopt`              | **Integrate Momo into an existing project.** Detects current structure and injects `momo.config.json` and shared configs. |
| `momo update`             | Sync local shared configs (TypeScript, Biome, etc.) with the latest Momo blueprints.                                      |
| `momo remove <name>`      | Safely remove an app or package from the workspace.                                                                       |
| `momo rename <old> <new>` | Rename a workspace package and update all references.                                                                     |
| `momo setup publish`      | Configure npm publishing: set up `.npmrc`, `publishConfig`, changesets, and CI release workflow.                          |
| `momo setup open-source`  | Add `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and issue/PR templates.                                           |

---

## 🚀 v1.0.0 — Major Release (Deployment, Premium Blueprints & Migration)

The full-featured, production-ready release.

### Unified Deployment

- `momo deploy init`: Auto-detect platform (Vercel, Netlify, Railway).
- `momo deploy push`: Build → verify → deploy.

### Premium Blueprints

- `momo init --blueprint saas`: Full SaaS starter (Auth, DB, Shared UI).
- `momo init --blueprint ecommerce`: Storefront + Admin + Payment SDK.

---

## 📊 Release Timeline (Tentative)

```mermaid
gantt
    title Create Momo Release Plan
    dateFormat YYYY-MM
    section Patch
        v0.5.1 Maintenance         :active, p1, 2026-03
    section Minor
        v0.6.0 Momo 2.0 Refactor   :m2, 2026-03
        v0.7.0 Project Lifecycle   :m3, 2026-04
    section Major
        v1.0.0 Deployment & Blueprints :maj1, 2026-05
```

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
