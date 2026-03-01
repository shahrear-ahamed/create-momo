# Create-Momo

> The engine behind the Momo ecosystem. A high-performance, context-aware CLI tool for scaffolding and managing Turborepo monorepos.

## ✨ Features

- **Context-Aware Architecture**: Automatically detects if it's running in a project root to switch between **Creation** and **Management** modes.
- **Unified Task Orchestration**: Wraps complex standard tasks (`build`, `dev`, `lint`) into simple, memorable commands.
- **Ecosystem Agnostic**: First-class support for `pnpm`, `npm`, `yarn`, and `bun` workspace structures.
- **Standardized Scaffolding**: Provides consistent blueprints for apps and packages ensuring architectural integrity across the monorepo.
- **Project Health Analysis**: Integrated `momo doctor` to validate monorepo structure and identify potential issues early.
- **Configuration Management**: A centralized `momo config` system for managing both local project and global CLI settings.

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
Once inside a Momo project, the `momo` command is available for management. Running `momo` alone inside a project displays the help menu. Running `momo` outside a project launches the creation wizard.

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

| Command | Counterpart | Description |
| :--- | :--- | :--- |
| **`momo dev`** | `turbo dev` | Orchestrate development servers. |
| **`momo build`** | `turbo build` | Optimized mono-repo builds. |
| **`momo lint`** | `turbo lint` | Strict Biome-powered static analysis. |
| **`momo test`** | `turbo test` | Run tests via Vitest/Turbo. |
| **`momo clean`** | - | Nuclear cleaning of build artifacts. |
| **`momo doctor`** | - | Health-check for project integrity. |
| **`momo graph`** | `turbo graph` | Interactive dependency visualization. |
| **`momo list`** | - | Show available templates and flavors. |
| **`momo config`** | - | Local/Global CLI preference management. |
| **`momo login`** | `turbo login` | Authenticate with Remote Cache. |

---

## 🛠 Command Deep Dive

### `create-momo <name> [--blueprint <type>]`
The main entry point for new projects. Use `--blueprint` to skip the interactive selection:
- `momo-starter-minimal`: Bare-bones essential structure.
- `momo-starter-saas`: Full-stack with Next.js, UI, and shared configs.

### `momo add <type> [name] [--flavor <flavor>]`
Fast scaffolding for monorepo units.
- **Flavors**: `with-nextjs`, `with-node-express`, `with-react-vite`, `with-ui-shared`.
- **Automatic Setup**: Handles `tsconfig` extends and project namespacing out of the box.

### `momo doctor`
Validates that:
1. `momo.config.json` is correctly configured.
2. The package manager matches the active lockfile.
3. Standard directories (`apps/`, `packages/`) exist.
4. Turborepo is installed and runnable.

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
