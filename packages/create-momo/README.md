# create-momo

A modern, high-performance CLI tool for scaffolding and managing Turborepo monorepo projects with a premium developer experience.

## ✨ Features

- **Context-Aware CLI**: Behaves as a **Project Creator** outside a project and a **Project Manager** inside one.
- **Zero-Config Monorepos**: Scaffold production-ready monorepos using `pnpm`, `npm`, `yarn`, or `bun`.
- **Project Wrappers**: Unified commands like `momo dev`, `momo build`, and `momo lint` that delegate to Turborepo.
- **Smart Scaffolding**: Add apps, packages, or standardized configurations with `momo add`.
- **Professional CI/CD**: Optimized GitHub Actions workflows for automated releases and multi-branch support.

## 🚀 Usage

You don't need to install `create-momo` globally. Use it directly with your favorite package manager:

```bash
# npm
npx create-momo [project-name]

# pnpm
pnpm create momo [project-name]

# bun
bun create momo [project-name]
```

## 🛠 Commands

Once inside a `create-momo` project, navigate into the directory and use the management commands:

### 1. Project Management
- **`momo dev`**: Starts the development environment for all apps and packages.
- **`momo build`**: Builds all packages in the monorepo.
- **`momo lint`**: Runs linting checks (Biome) across the workspace.
- **`momo start`**: Starts the production build.

### 2. Scaffolding
- **`momo add`**: Interactively add a new app (Next.js, Vite, etc.) or package (shared library) to the workspace.

### 3. Setup & Config
- **`momo setup publish`**: Configure automated npm publishing.
- **`momo setup open-source`**: Add `LICENSE`, `CONTRIBUTING`, and `README` templates.
- **`momo config list/set`**: Manage CLI and project configurations.

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
