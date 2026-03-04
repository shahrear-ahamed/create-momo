# Momo CLI 🛡️⚡️

![momo-banner](assets/banner.png)

[![npm version](https://img.shields.io/npm/v/create-momo.svg)](https://www.npmjs.com/package/create-momo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The high-performance, context-aware engine to **supercharge and boost** your Turborepo monorepo management.

**Momo CLI** is designed to eliminate the friction of monorepo management and boost your productivity with Turborepo. Whether you're bootstrapping a new project or scaling an existing one, Momo provides a unified, intuitive, and "hassle-free" developer experience.

---

## ✨ Features (Momo 2.0)

- **Unified Command Hierarchy**: Logical grouping of commands (Management, Orchestration, Execution, Infra).
- **Blank Workspaces**: Specialized `blank` templates for rapid, boilerplate-free workspace creation.
- **Smart Routing**: Automatically detects target directories (`apps/` vs `packages/`) via template metadata.
- **Universal Framework Support**: Native integration with any external initializer (`svelte`, `nuxt`, `nest`) via the `external` flavor.
- **Shadcn UI Integration**: Seamlessly inject Shadcn components into your UI library using `momo install shadcn:<component>`.
- **Turbo Orchestration**: Lightweight, user-friendly wrappers around `turbo run` via `momo run`.
- **Intelligent Dependencies**: A dedicated `momo install` command that handles workspace protocols and target detection automatically.

---

## 🚀 Usage Guide

### 1. Bootstrap a New Project

Initialize a new project using your favorite package manager:

```bash
# Using PNPM (Recommended)
pnpm create momo my-project

# Using NPM
npx create-momo@latest my-project

# Using Bun
bun create momo my-project

# Using Yarn
yarn create momo my-project

# Initialize in the current directory
npx create-momo@latest .
```

### 2. Extend Your Structure (`momo add`)

```bash
momo add app --name web         # Add an application
momo add package --name utils   # Add a package
momo add config --name tailwind # Add a shared config
```

### 3. Manage Dependencies (`momo install`)

```bash
momo install zod -w             # Global NPM Install
momo install lucide-react -a web # Target specific app
momo install shadcn:button      # Inject UI component
```

---

## 🛠 Complete Command Reference

### 🏗 Management (Code & Structure)

| Command            | Description                                  | Detail        |
| :----------------- | :------------------------------------------- | :------------ |
| **`momo create`**  | Bootstrap a new monorepo project             | **Entry**     |
| **`momo add`**     | Add new workspaces (Apps, Packages, Configs) | **Structure** |
| **`momo install`** | Inject Dependencies (NPM) or UI (`shadcn:`)  | **Content**   |
| **`momo list`**    | List available component flavors and types   | **Utility**   |

### ⚡️ Execution (Turbo-Powered)

| Command          | Description                             | Detail        |
| :--------------- | :-------------------------------------- | :------------ |
| **`momo run`**   | Execute workspace tasks (via Turborepo) | `turbo run`   |
| **`momo build`** | Build all packages in the monorepo      | **Shorthand** |
| **`momo dev`**   | Run development mode for all packages   | **Shorthand** |
| **`momo lint`**  | Lint all packages in the monorepo       | **Shorthand** |
| **`momo test`**  | Run tests across the workspace          | **Shorthand** |
| **`momo start`** | Start production builds                 | **Shorthand** |
| **`momo clean`** | Recursive cleanup of build artifacts    | **Utility**   |

### 🔧 Orchestration & Utility

| Command           | Description                              | Detail          |
| :---------------- | :--------------------------------------- | :-------------- |
| **`momo graph`**  | Visualize the dependency graph           | **Utility**     |
| **`momo doctor`** | Check project health & standards         | **Utility**     |
| **`momo config`** | Manage CLI settings and context          | **Settings**    |
| **`momo setup`**  | Configure project-wide standards         | **Coming Soon** |
| **`momo update`** | Interactive workspace dependency manager | **Lifecycle**   |
| **`momo rename`** | Safely rename internal packages          | **Lifecycle**   |

### 🌐 Infrastructure (Remote Caching)

| Command           | Description                          | Detail          |
| :---------------- | :----------------------------------- | :-------------- |
| **`momo login`**  | Log in to Turborepo (Remote Caching) | **Auth**        |
| **`momo logout`** | Log out from Turborepo               | **Auth**        |
| **`momo link`**   | Link project to Vercel Team          | **Infra**       |
| **`momo unlink`** | Unlink project from Remote Caching   | **Infra**       |
| **`momo deploy`** | Unified deployment workflows         | **Coming Soon** |

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
