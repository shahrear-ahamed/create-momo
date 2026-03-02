# Momo CLI 2.0 🛡️⚡️

> The high-performance, context-aware engine for managing modern Turborepo monorepos.

**Momo CLI** is designed to eliminate the friction of monorepo management. Whether you're bootstrapping a new project or scaling an existing one, Momo provides a unified, intuitive, and "hassle-free" developer experience.

---

## ✨ Features (Momo 2.0)

- **Unified Command Hierarchy**: Logical grouping of commands (Management, Orchestration, Execution, Infra).
- **Smart Routing**: Automatically detects whether a template belongs in `apps/` or `packages/` via `momo.json` metadata.
- **Universal Scaffolding**: Support for any external framework initializer (`momo add svelte`, `momo add nest`, `momo add nuxt`).
- **Shadcn UI Protocol**: Seamlessly inject Shadcn components into your UI library using `momo install shadcn:<component>`.
- **Turbo-Powered Execution**: Lightweight, user-friendly wrappers around `turbo run` via `momo run`.
- **Intelligent Dependency Management**: A dedicated `momo install` command that handles workspace protocols and target detection.

---

## 🚀 Getting Started

### 1. Bootstrap a New Project

```bash
# Sinks into a creation wizard if run outside a project
npx create-momo@latest my-momo-app
```

### 2. Extend Your Structure (`momo add`)

Use `add` to create new **Workspaces** (Apps, Packages, Configs).

```bash
# Internal Templates
momo add nextjs --name web
momo add ui-shared --name ui

# External Frameworks (Universal Fallback)
momo add svelte --name my-app
momo add nest --name api
```

### 3. Inject Code & Components (`momo install`)

Use `install` to add **Content** into existing workspaces.

```bash
# Install NPM Dependencies
momo install zod
momo install lucide-react --to-pkg ui

# Inject Shadcn Components
momo install shadcn:button
momo install shadcn:dialog
```

---

## 🛠 Command Reference

### Management (Structure & Code)

| Command        | Description                                      |
| :------------- | :----------------------------------------------- |
| `momo create`  | Bootstrap a new monorepo project (Blueprints)    |
| `momo add`     | Add new **Workspaces** (Apps, Packages, Configs) |
| `momo install` | Inject **Code** or **Components** (NPM, Shadcn)  |
| `momo list`    | List available templates and blueprints          |

### Orchestration & Infrastructure

| Command       | Description                                          |
| :------------ | :--------------------------------------------------- |
| `momo setup`  | Configure project infrastructure (CI, Env, Registry) |
| `momo config` | Manage global/local CLI preferences                  |
| `momo doctor` | Run a project health and standards audit             |
| `momo graph`  | Visualize the project dependency graph               |

### Execution & Deployment (Turbo-Powered)

| Command       | Description                                    |
| :------------ | :--------------------------------------------- |
| `momo run`    | Execute workspace tasks (powered by Turborepo) |
| `momo build`  | Build all or filtered packages                 |
| `momo dev`    | Run development mode across the workspace      |
| `momo login`  | Sync with Turborepo Remote Caching             |
| `momo deploy` | Unified deployment workflows (Vercel, etc.)    |

---

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
