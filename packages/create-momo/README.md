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
Once a project is created, `create-momo` is available as the `momo` command.

```bash
# Add a new app via action flag
momo add -a

# Install a dependency (Smart Detection)
momo add -d zod
momo get @momo/ui --to-app web
```

---

## 🛠 Command Deep Dive

### `create-momo <name>`
The entry point for new monorepos. Handles directory validation, scope assignment, and reliable package manager version detection (e.g., `pnpm@9.1.0`).

### `momo add [-a|-p|-d]`
The unified scaffolding entry point.
- **-a, --app [name]**: Scaffold Next.js, Vite, or Node apps into `apps/`.
- **-p, --package [name]**: Create shared libraries in `packages/`.
- **-d, --dep [name]**: Intelligent dependency management that handles workspace protocols automatically. Use `--to-app` (`-A`) or `--to-pkg` (`-P`) to target specific workspaces.

### `momo dev | build | lint | start`
High-level wrappers around `turbo`. Supports all native flags like `--filter` (alias `-f`), `--parallel`, and `--cache-dir`.

### `momo doctor | list | update`
- **`doctor`**: Health checks for your monorepo.
- **`list`**: View available component flavors.
- **`update`**: Keep your configs in sync.

### `momo setup <subcommand>`
- **`publish`**: Automated npm publishing workflows.
- **`open-source`**: Standard LICENSE and community files.
- **`project`**: Adjust project blueprint settings.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
