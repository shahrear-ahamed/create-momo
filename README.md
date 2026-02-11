# create-momo

![momo-banner](https://github.com/shahrear-ahamed/create-momo/blob/main/packages/create-momo/assets/banner.png?raw=true)

> A premium CLI tool for scaffolding and managing high-performance Turborepo monorepos with an intuitive, context-aware developer experience.

[![npm version](https://img.shields.io/npm/v/create-momo.svg)](https://www.npmjs.com/package/create-momo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **Zero-Config Monorepos**: Instant Turborepo setup with your choice of `pnpm`, `npm`, `yarn`, or `bun`.
- 🧠 **Context-Aware CLI**: One command for everything. It's a **Project Creator** outside a project and a **Project Manager** inside one.
- 🛠️ **Project Management**: Built-in wrappers for common tasks: `momo dev`, `momo build`, `momo lint`, and `momo start`.
- 🎨 **Premium UX**: Interactive prompts powered by `@clack/prompts` with a beautiful gradient-branded interface.
- 📦 **Smart Scaffolding**: Effortlessly add new apps and packages to your existing monorepo with `momo add`.
- ⚙️ **Professional Tooling**: Pre-configured with Biome, TypeScript, and optimized GitHub Actions CI/CD workflows.

## 🚀 Quick Start

Create a new monorepo project instantly:

```bash
# Using your preferred package manager
pnpm create momo
# or
npx create-momo@latest my-project
# or
bun create momo .
```

The CLI will guide you through the setup, including project name, package scope, and package manager selection.

## 🛠 Project Management

Once your project is created, navigate into the directory and use `momo` to manage your workflow:

```bash
cd my-project
pnpm install

# Run development mode for all packages
pnpm momo dev

# Build all packages
pnpm momo build

# Add a new application or package
pnpm momo add
```

*Note: Since `create-momo` is added to your project's `devDependencies`, you can run it via your package manager without a global installation.*

## ⏳ What's Next?

- **SaaS Blueprints**: Pre-configured templates for Next.js + Supabase + Auth.js.
- **Momo Doctor**: Automated health checks for your monorepo configurations.
- **Deployment Hub**: Streamlined deployment workflows for Vercel, Netlify, and Docker.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
