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
*These are used to start new projects or initialize existing directories.*

- **`create-momo [name]`**: The root command for project initialization.
- **`create-momo .`**: Initialize in the current directory.

### Management Commands
*Run these inside your project directory to manage your monorepo.*

| Command | Shortcut | Description |
| :--- | :--- | :--- |
| **`momo dev`** | `turbo dev` | Runs development mode for all apps/packages in parallel. |
| **`momo build`** | `turbo build` | Executes the production build for the entire monorepo. |
| **`momo lint`** | `biome check` | Runs linting and formatting across the workspace. |
| **`momo add`** | - | Launches the interactive wizard to add new apps or packages. |
| **`momo setup`** | - | Subcommands for `publish`, `open-source`, or `close-source` config. |

---

## 🏗 Project Architecture

A standard **Momo** project follows a modular structure optimized for caching and reuse:

```text
my-project/
├── apps/                # Your applications (Next.js, Vite, etc.)
├── packages/            # Shared libraries and configurations
│   ├── config-typescript/ # Shared TS settings
│   └── ...
├── momo.config.json     # Project-specific CLI configuration
├── turbo.json           # Turborepo orchestration settings
└── package.json         # Root workspace management
```

---

## ⏳ Roadmap

- [ ] **SaaS Blueprints**: Pre-configured templates with Auth, DB, and UI pre-integrated.
- [ ] **Momo Doctor**: Automated health checks for your monorepo dependencies.
- [ ] **Deployment Flows**: One-click deployment configurations for Vercel and Netlify.
- [ ] **Custom Templates**: Support for user-defined blueprints.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Built with ❤️ by [Shahrear Ahamed](https://github.com/shahrear-ahamed).
