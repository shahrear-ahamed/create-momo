# Create-Momo

> The engine behind the Momo ecosystem. A high-performance, context-aware CLI tool for scaffolding and managing Turborepo monorepos.

## ✨ Features

- **Context-Aware Architecture**: Automatically detects if it's running in a project root to switch between **Creation** and **Management** modes.
- **Unified Task Orchestration**: Wraps complex standard tasks (`build`, `dev`, `lint`) into simple, memorable commands.
- **Ecosystem Agnostic**: First-class support for `pnpm`, `npm`, `yarn`, and `bun` workspace structures.
- **Standardized Scaffolding**: Provides consistent blueprints for apps and packages ensuring architectural integrity across the monorepo.

---

## 🚀 Installation & Usage

You can use **Create-Momo** through your preferred package manager's "create" command. No global installation is strictly required.

### 1. Scaffolding a New Project
```bash
# npm
npx create-momo@latest my-project

# pnpm
pnpm create momo my-project

# bun
bun create momo my-project
```

### 2. Management within a Project
Once a project is created, `create-momo` is automatically added to your `devDependencies`. Use it to manage your workspace:

```bash
# Add a new app or package
pnpm momo add

# Orchestrate project tasks
pnpm momo dev
pnpm momo build
pnpm momo lint
```

---

## 🛠 Command Deep Dive

### `create-momo [project-name]`
The entry point for new monorepos. If a name is not provided, it prompts for one. It handles directory validation, scope assignment, and package manager detection.

### `momo add`
The primary scaffolding command. It guides you through adding:
- **Apps**: Next.js, Vite, or other frontend flavors.
- **Packages**: Shared libraries, config packages, or UI kits.

### `momo dev | build | lint | start`
High-level wrappers around `turbo [task]`. These commands ensure that the correct environment variables and filters are applied based on your `momo.config.json`.

### `momo setup <subcommand>`
- **`publish`**: Sets up automated npm publishing workflows.
- **`open-source`**: Drops a standard suite of community files (LICENSE, README, etc.).
- **`project`**: Allows re-selecting or updating the project's foundational blueprint.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
