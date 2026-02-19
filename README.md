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

- **`create-momo <name>`**: Initializes a fresh Turborepo project.
- **`create-momo .`**: Initializes in the current directory (blocks nesting if already in a Momo project).

---

### 2. Management within a Project
Once a project is created, `create-momo` is available as the `momo` command. Running `momo` without arguments will display the help menu.

---

| Command | Counterpart | Description |
| :--- | :--- | :--- |
| **`momo build`** | `turbo build` | Build all or filtered workspaces. |
| **`momo dev`** | `turbo dev` | Run dev servers for all or filtered workspaces. |
| **`momo lint`** | `turbo lint` | Lint/format all packages via Biome/Turbo. |
| **`momo start`** | `turbo start` | Start production builds of your apps. |
| **`momo add`** | - | **Unified Scaffolding**: Add apps, packages, or deps. |
| **`momo get`** | `pnpm add` | Alias for `momo add -d`. Installs a dependency. |
| **`momo doctor`** | - | Check project health and structure validity. |
| **`momo list`** | - | List available component flavors (Next.js, Node, etc.). |
| **`momo config`** | - | Manage CLI settings (`list`, `get`, `set`). |
| **`momo setup`** | - | **(Coming Soon)**: Standards: `project`, `publish`, etc. |
| **`momo deploy`** | - | **(Coming Soon)**: Unified deployment workflows. |
| **`momo update`** | - | **(Coming Soon)**: Sync local configs with blueprints. |

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
├── apps/                # Applications (Next.js, Vite, etc.)
├── packages/            # Shared libraries and configurations
│   ├── config-typescript/ # Shared TS settings
│   └── ...
├── momo.config.json     # CLI configuration
├── turbo.json           # Turborepo settings
└── package.json         # Workspace root
```

---

## ⏳ Roadmap

- [x] **Unified CLI**: Single entry point via `momo add`.
- [x] **Turbo Orchestration**: Full pass-through flag support.
- [x] **Context Awareness**: Blocks nested project creation.
- [ ] **Turbo Auth**: Integrated `momo login/logout`.
- [ ] **Premium Blueprints**: Pre-configured SaaS templates.
- [ ] **Unified Deployment**: One-click Vercel/Netlify integration.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
