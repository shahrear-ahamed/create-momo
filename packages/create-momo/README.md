# Create-Momo

> The engine behind the Momo ecosystem. A high-performance, context-aware CLI tool for scaffolding and managing Turborepo monorepos.

## ✨ Features

- **Zero-Config Scaffolding**: Native support for **PNPM**, **NPM**, **Yarn**, and **Bun**.
- **Context-Aware Intelligence**: Automatically detects project roots to switch between **Creation** and **Management** modes.
- **Unified Task Orchestration**: Wraps complex standard tasks (`build`, `dev`, `lint`) into simple, memorable commands.
- **Premium Blueprints**: Standardized starters for SaaS and minimal projects.
- **Project Health Analysis**: Integrated `momo doctor` to validate monorepo integrity.
- **Smart Dependency Management**: Intelligent `momo get` handling of workspace protocols.

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
| **`momo add`**    | -              | **Scaffold**: Add apps, packages, or template flavors.    |
| **`momo get`**    | `pnpm add`     | Fast-track dependency addition (alias for `add -d`).      |
| **`momo list`**   | -              | List all available templates and flavors.                 |
| **`momo config`** | -              | **Settings**: Manage global/local CLI preferences.        |
| **`momo login`**  | `turbo login`  | Sync with Turborepo Remote Cache.                         |
| **`momo logout`** | `turbo logout` | Revoke remote cache authentication.                       |
| **`momo link`**   | `turbo link`   | Connect workspace to Vercel/Turbo teams.                  |
| **`momo unlink`** | `turbo unlink` | Disconnect from remote caching.                           |

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
