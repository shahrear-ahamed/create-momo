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

- **Unified Command Hierarchy**: Logical verbs like `add`, `install`, and `run`.
- **Smart Scaffolding**: `momo add` for apps, packages, and frameworks with universal fallback.
- **Content Injection**: `momo install` for NPM dependencies and `shadcn:` components.
- **Turbo Orchestration**: Native task execution via `momo run` (with shorthands like `momo build`).
- **Project Health**: Integrated `momo doctor` audit for workspace standards.

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

| Command            | Description                                              | Type          |
| :----------------- | :------------------------------------------------------- | :------------ |
| **`momo add`**     | Add new **Workspaces** (Apps, Packages, Shared Configs). | **Structure** |
| **`momo install`** | Inject **Code** or **Components** (NPM, `shadcn:`).      | **Content**   |
| **`momo run`**     | Execute workspace tasks (Build, Dev, Lint, Test).        | **Execution** |
| **`momo setup`**   | Configure **Infra** (CI Workflows, Env packages).        | **Orchestra** |
| **`momo list`**    | List available component flavors (Local & Remote).       | **Utility**   |
| **`momo doctor`**  | Run a project health and standards audit.                | **Utility**   |
| **`momo graph`**   | Visualize the project dependency graph.                  | **Utility**   |
| **`momo config`**  | Manage global/local CLI preferences.                     | **Settings**  |
| **`momo login`**   | Sync with Turborepo Remote Caching (Vercel).             | **Infra**     |

#### 🎯 Turbo Shorthands

Momo provides natural shorthands for common Turborepo tasks:

```bash
momo build --filter web   # Shorthand for 'momo run build'
momo dev -f ui            # Shorthand for 'momo run dev'
momo test                 # Shorthand for 'momo run test'
```

#### 📦 Smart Content Integration

`momo install` (alias `get`) handles workspace protocols and target detection automatically.

```bash
momo install zod -w             # Install to root
momo install shadcn:button      # Inject UI component to /packages/ui
momo install @momo/ui --to web  # Link internal package to app
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
- [ ] **Project Lifecycle (v0.7.0)**: Adoption, Renaming, and Syncing tools.
- [ ] **Premium Blueprints**: Pre-configured SaaS templates (Ecommerce, Dashboards).
- [ ] **Unified Deployment**: One-click Vercel/Netlify integration.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
