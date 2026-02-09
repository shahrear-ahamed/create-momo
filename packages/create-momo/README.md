# create-momo

A modern, high-performance CLI tool for scaffolding and managing monorepo projects with ease. Built for speed, consistency, and a premium developer experience.

## ✨ Features

- **Instant Scaffolding**: Create a production-ready monorepo project in seconds.
- **Component Management**: Effortlessly add apps and packages with pre-configured TypeScript and workspaces.
- **Premium UI**: Beautiful CLI interface with interactive prompts and status indicators.
- **Built-in Workflows**: Integrated commands for configuration, setup, and deployment.

## 🚀 Quick Start

Get started immediately without installation:

```bash
pnpm create momo
# or
npx create-momo@latest
```

## 🛠 Commands

### Core

#### `create [project-name]`
Initialize a new monorepo project. If no name is provided, it will prompt you.
```bash
momo create my-awesome-project
```

#### `add`
Add a new application or package to your monorepo. It will guide you through selecting a location (`/apps` or `/packages`) and a technology flavor.
```bash
momo add
```

### Setup & Config

#### `setup`
Configure project-wide settings and documentation.
- `momo setup publish`: Configure npm registry and publishing settings.
- `momo setup open-source`: Add community files (LICENSE, CONTRIBUTING).
- `momo setup close-source`: Configure for proprietary use.

#### `config`
Manage CLI global and project-specific configurations.
- `momo config list`: View all settings.
- `momo config set <key> <value>`: Update a setting.

### Utility

#### `doctor`
Check the health of your monorepo, verifying dependencies and configurations.
```bash
momo doctor
```

#### `list`
List all available component flavors and templates.
```bash
momo list
```

---

## ⏳ Coming Soon

We're constantly improving `create-momo`. Here’s what’s on the horizon:

- **Shortcut Commands**: `momo push` for instant deployment. `[Coming Soon]`
- **Direct Addition**: `momo add app <name>` and `momo add package <name>` to skip prompts. `[Coming Soon]`
- **Auto Documentation**: `momo setup readme` to generate standard READMEs for your sub-packages. `[Coming Soon]`
- **Pre-configured Blueprints**: SaaS Starters (Next.js + Supabase) and API Services (Express + Docker). `[Coming Soon]`
- **Plugin System**: Extend the CLI with your own custom commands and templates. `[Coming Soon]`

## 📄 License

MIT © [Shahrear Ahamed](https://github.com/shahrear-ahamed)
