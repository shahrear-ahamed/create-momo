# Create Momo

![momo-banner](https://github.com/shahrear-ahamed/create-momo/blob/main/packages/create-momo/assets/banner.png?raw=true)

> **Create Momo** is a premium, context-aware CLI tool designed to simplify the creation and management of high-performance Turborepo monorepos. It provides a standardized, production-ready environment for modern web development.

[![npm version](https://img.shields.io/npm/v/create-momo.svg)](https://www.npmjs.com/package/create-momo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Building monorepos shouldn't be complex. **Create Momo** automates the tedious parts of monorepo orchestration—from initial scaffolding to ongoing management. Whether you're building a SaaS, an e-commerce platform, or a suite of shared libraries, Momo provides the structure and tools you need to move fast and stay consistent.

---

## ✨ Key Features

### 🚀 Zero-Config Scaffolding

- **Package Manager Agnostic**: Native support for **PNPM**, **NPM**, **Yarn**, and **Bun**.
- **Instant Productivity**: Scaffolds full workspaces with standardized blueprints.

### 🧠 Context-Aware Intelligence

- **Creation Mode**: Run in empty directories to launch the project wizard.
- **Management Mode**: Run inside projects for powerful dev/utility commands.

### 🛠️ Integrated Project Management

- **Command Wrappers**: Unified `momo build/dev/lint` built on OXC and Turborepo.
- **Advanced Scaffolding**: Use `momo add` for apps, packages, or shared configs.
- **Project Setup**: Automated `momo setup ci` and `momo setup env` for rapid orchestration.
- **Project Health**: Integrated `momo doctor` and `momo graph` for workspace audit.

---

## 🚀 Quick Start

You can start a new project immediately without any global installation:

### 1. Initialize Project

```bash
# Using PNPM (Recommended)
pnpm create momo my-project

# Using NPM
npx create-momo@latest my-project

# Using Bun
bun create momo my-project
```

### 2. Follow the Wizard

The CLI will guide you through:

- Project name and directory setup
- Package scope (e.g., `@momo`)
- Your preferred package manager

---

## 🛠 Command Reference

### Creation Commands

_Used to initialize new monorepo projects._

- **`pnpm create momo <name>`** / **`npx create-momo <name>`**: Scaffolds a new project.
- **`create-momo .`**: Initializes in the current directory.
- **`momo`** _(outside a project)_: Launches the interactive creation wizard.

#### 🏗 Scaffolding Options

Use flags to skip interactive prompts:

- `--blueprint <type>`: Choose from `momo-starter-minimal` or `momo-starter-saas`.
- `--scope <name>`: Define your workspace package prefix.

---

### Management Commands

_Run these inside your project directory. Typing `momo` alone inside a project displays the help menu._

---

| Command           | Counterpart    | Description                                               |
| :---------------- | :------------- | :-------------------------------------------------------- |
| **`momo build`**  | `turbo build`  | Build all or filtered workspaces.                         |
| **`momo dev`**    | `turbo dev`    | Run development servers with hot-reloading.               |
| **`momo lint`**   | `turbo lint`   | Clean and format using Biome/Turbo.                       |
| **`momo start`**  | `turbo start`  | Run production builds of your apps.                       |
| **`momo test`**   | `turbo test`   | Execute unit and integration tests.                       |
| **`momo clean`**  | -              | **Recursively** delete `node_modules`, `dist`, and cache. |
| **`momo doctor`** | -              | **Audit**: Check project health and structure.            |
| **`momo graph`**  | `turbo graph`  | **Graph**: Visualize project dependency map.              |
| **`momo add`**    | -              | **Scaffold**: Add apps, packages, or shared configs.      |
| **`momo setup`**  | -              | **Orchestrator**: Configure CI/CD, envs, and standards.   |
| **`momo get`**    | `pnpm add`     | Fast-track dependency addition (alias for `add -d`).      |
| **`momo list`**   | -              | List local or remote templates (`--remote`).              |
| **`momo config`** | -              | **Settings**: Manage global/local CLI preferences.        |
| **`momo login`**  | `turbo login`  | Sync with Turborepo Remote Cache.                         |
| **`momo logout`** | `turbo logout` | Revoke remote cache authentication.                       |
| **`momo link`**   | `turbo link`   | Connect workspace to Vercel/Turbo teams.                  |
| **`momo unlink`** | `turbo unlink` | Disconnect from remote caching.                           |

#### 🎯 Turbo Filter Support

All management commands support native Turbo flags.

```bash
# Target specific apps
momo dev --filter web
momo build -f ui

# Use any Turbo flag
momo lint --parallel --continue
```

#### 📦 Smart Dependency Addition

`momo add -d <package>` (or `momo get`) automatically detects internal workspace packages and uses the `workspace:*` protocol.

```bash
momo get zod -w             # Install to root
momo get @momo/ui --to-app web # Install internal package to app
momo add -d lodash -A web   # Short flag alias for targeting
```

---

## 🎨 Templates & Blueprints

Momo's scaffolding is powered by a flexible, root-level template system. You can use pre-defined blueprints for new projects or component flavors for adding apps and packages.

**Available Blueprints:** `blank`, `minimal`, `saas`.  
**Available Flavors:** `with-nextjs`, `with-node-express`, `with-react-vite`, `with-expo`, `with-tanstack-start`.
**Config Scaffolding:** `oxc`, `typescript`, `tailwind`, `vitest`.

> [!TIP]
> Want to add your own templates? Check out our [Templates & Blueprints Guide](./docs/templates.md).

---

## 🏗 Project Architecture

A standard **Momo** project follows a modular structure:

```text
my-project/
├── apps/                # High-level applications
│   └── web/             # Next.js / Vite / React apps
├── packages/            # Modular shared resources
│   ├── ui/              # Shared component library
│   ├── utils/           # Shared logic
│   └── config-typescript/ # Centralized TS configurations
├── templates/           # Blueprints & Component templates (Internal)
├── momo.config.json     # CLI context & project configuration
├── turbo.json           # Turborepo task pipelines
└── package.json         # Workspace root definitions
```

---

## ⏳ Roadmap

- [x] **Unified CLI**: Single entry point via `momo add`.
- [x] **Turbo Orchestration**: Full pass-through flag support.
- [x] **Context Awareness**: Blocks nested project creation.
- [x] **Turbo Auth**: Integrated `momo login/logout`.
- [x] **Workspace Hygiene**: Integrated `momo clean`.
- [x] **Advanced Scaffolding**: `momo add config` and `momo setup`.
- [ ] **Premium Blueprints**: Pre-configured SaaS templates (Ecommerce, Dashboards).
- [ ] **Unified Deployment**: One-click Vercel/Netlify integration.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
