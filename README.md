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
- **Instant Productivity**: Scaffolds a full Turborepo workspace with apps, packages, and shared configs in seconds.

### 🧠 Context-Aware Intelligence
- **Creation Mode**: Run it in an empty directory to launch the interactive project wizard.
- **Management Mode**: Run it inside a Momo project to access powerful utility and development commands.

### 🛠️ Integrated Project Management
- **Command Wrappers**: Unified commands like `momo dev`, `momo build`, and `momo lint` that handle cross-package orchestration via Turborepo.
- **Component Scaffolding**: Use `momo add` to instantly drop new apps or shared packages into your existing workspace.

### 🎨 Premium Developer Experience
- **Interactive Prompts**: Beautiful, human-friendly CLI powered by `@clack/prompts`.
- **Branded Interface**: A polished UI with gradient logos and clear status indicators.
- **GitHub Actions Ready**: Pre-configured CI/CD workflows for automated PR testing and releases.

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
*Used to initialize new monorepo projects.*

- **`pnpm create momo <name>`** / **`npx create-momo <name>`**: Scaffolds a new Turborepo project.
- **`create-momo .`**: Initializes in the current directory.
- **`momo`** *(outside a project)*: Launches the interactive creation wizard.

---

### Management Commands
*Run these inside your project directory. Typing `momo` alone inside a project displays the help menu.*

---

| Command | Counterpart | Description |
| :--- | :--- | :--- |
| **`momo build`** | `turbo build` | Build all or filtered workspaces. |
| **`momo dev`** | `turbo dev` | Run development servers with hot-reloading. |
| **`momo lint`** | `turbo lint` | Clean and format using Biome/Turbo. |
| **`momo start`** | `turbo start` | Run production builds of your apps. |
| **`momo test`** | `turbo test` | Execute unit and integration tests. |
| **`momo clean`** | - | **Recursively** delete `node_modules`, `dist`, and cache. |
| **`momo doctor`** | - | **Audit**: Check project health and structure. |
| **`momo graph`** | `turbo graph` | **Graph**: Visualize project dependency map. |
| **`momo add`** | - | **Scaffold**: Add apps, packages, or template flavors. |
| **`momo get`** | `pnpm add` | Fast-track dependency addition (alias for `add -d`). |
| **`momo list`** | - | List all available templates and flavors. |
| **`momo config`** | - | **Settings**: Manage global/local CLI preferences. |
| **`momo login`** | `turbo login` | Sync with Turborepo Remote Cache. |
| **`momo logout`** | `turbo logout` | Revoke remote cache authentication. |
| **`momo link`** | `turbo link` | Connect workspace to Vercel/Turbo teams. |
| **`momo unlink`** | `turbo unlink` | Disconnect from remote caching. |

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
- [ ] **Premium Blueprints**: Pre-configured SaaS templates.
- [ ] **Unified Deployment**: One-click Vercel/Netlify integration.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
