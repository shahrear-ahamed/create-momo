# Create Momo

![momo-banner](https://github.com/shahrear-ahamed/create-momo/blob/main/packages/create-momo/assets/banner.png?raw=true)

> **Create Momo** is a premium, context-aware CLI tool designed to **supercharge and boost your Turborepo** monorepo experience. It provides a standardized, production-ready environment for modern web development, automating the complex orchestration required for scale.

[![npm version](https://img.shields.io/npm/v/create-momo.svg)](https://www.npmjs.com/package/create-momo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Building monorepos shouldn't be complex. **Create Momo** acts as a powerful booster for Turborepo, automating the tedious parts of monorepo orchestration—from initial scaffolding to ongoing lifecycle management. Whether you're building a SaaS, an e-commerce platform, or a suite of shared libraries, Momo provides the structure and tools you need to move fast and stay consistent.

---

## ✨ Key Features

### 🚀 Zero-Config Scaffolding

- **Package Manager Agnostic**: Native support for **PNPM**, **NPM**, **Yarn**, and **Bun**.
- **Instant Productivity**: Scaffolds full workspaces with standardized blueprints.

### 🧠 Context-Aware Intelligence

- **Creation Mode**: Run in empty directories to launch the project wizard.
- **Management Mode**: Run inside projects for powerful dev/utility commands.

---

## 🚀 Quick Start

Initialize a new project in seconds:

```bash
# Using PNPM (Recommended)
pnpm create momo my-project

# Using NPM
npx create-momo@latest my-project

# Using Bun
bun create momo my-project
```

---

## 🛠 Command Reference

### 🏗 Management (Code & Structure)

| Command            | Description                                            | Context       |
| :----------------- | :----------------------------------------------------- | :------------ |
| **`momo create`**  | Bootstrap a new monorepo project (Blueprints)          | **Creation**  |
| **`momo add`**     | Add new workspaces (Apps, Packages, Configs)           | **Structure** |
| **`momo install`** | Inject dependencies (NPM) or UI components (`shadcn:`) | **Content**   |
| **`momo list`**    | List available component flavors and config types      | **Utility**   |

### ⚡️ Execution (Turbo-Powered)

| Command          | Description                                    | Detail        |
| :--------------- | :--------------------------------------------- | :------------ |
| **`momo run`**   | Execute workspace tasks (powered by Turborepo) | `turbo run`   |
| **`momo build`** | Build all packages in the monorepo             | **Shorthand** |
| **`momo dev`**   | Run development mode for all packages          | **Shorthand** |
| **`momo lint`**  | Lint all packages in the monorepo              | **Shorthand** |
| **`momo test`**  | Run tests across the workspace using Turborepo | **Shorthand** |
| **`momo start`** | Start production build for all packages        | **Shorthand** |
| **`momo clean`** | Recursive cleanup of build artifacts           | **Utility**   |

### 🔧 Orchestration & Utility

| Command           | Description                              | Detail          |
| :---------------- | :--------------------------------------- | :-------------- |
| **`momo graph`**  | Visualize the project dependency graph   | **Utility**     |
| **`momo doctor`** | Check project health and standards audit | **Utility**     |
| **`momo config`** | Manage CLI settings and project context  | **Settings**    |
| **`momo setup`**  | Configure project-wide standards         | **Coming Soon** |
| **`momo update`** | Interactive workspace dependency manager | **Lifecycle**   |
| **`momo rename`** | Safely rename internal packages          | **Lifecycle**   |

### 🌐 Infrastructure (Remote Caching)

| Command           | Description                                  | Detail          |
| :---------------- | :------------------------------------------- | :-------------- |
| **`momo login`**  | Log in to Turborepo (Remote Caching)         | **Auth**        |
| **`momo logout`** | Log out from Turborepo                       | **Auth**        |
| **`momo link`**   | Link project to Vercel Team (Remote Caching) | **Infra**       |
| **`momo unlink`** | Unlink project from Remote Caching           | **Infra**       |
| **`momo deploy`** | Deployment workflows                         | **Coming Soon** |

---

## 📦 Smart Content Integration

`momo install` handles workspace protocols and target detection automatically.

```bash
momo install zod -w             # Install to workspace root
momo install shadcn:button      # Inject component to /packages/ui
momo install @momo/ui --app web # Link internal package to app
```

---

## 🏗 Project Architecture

```text
my-project/
├── apps/                # High-level applications
├── packages/            # Modular shared resources
├── momo.config.json     # CLI context & configuration
├── turbo.json           # Turborepo task pipelines
└── package.json         # Workspace root definitions
```

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
