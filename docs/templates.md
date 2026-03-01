# Templates & Blueprints Guide

Momo uses a flexible, directory-based template system located in the root `/templates` directory. This guide explains how the system works and how you can add your own templates.

## 📂 Directory Structure

```text
templates/
├── blueprints/      # Full project starters (momo init)
│   ├── momo-starter-minimal/
│   └── momo-starter-saas/
└── components/      # Single apps or packages (momo add)
    ├── with-nextjs/
    ├── with-node-express/
    ├── with-react-vite/
    └── with-ui-shared/
```

## ⚙️ How it Works

The `templateEngine` utility handles the complexity of copying files and replacing dynamic values.

### 1. Placeholder Replacement
Any file inside a template can use `{{handlebars}}` style placeholders. When creating a project or component, Momo replaces these with actual values:

| Placeholder | Description | Example |
| :--- | :--- | :--- |
| `{{name}}` | The name of the project or component. | `my-web-app` |
| `{{scope}}` | The package scope from your config. | `@momo` |
| `{{packageManager}}` | The detected/selected package manager. | `pnpm` |
| `{{pmVersion}}` | The exact version of the package manager. | `9.1.0` |
| `{{version}}` | The version of the Momo CLI. | `0.5.1` |

### 2. Adding a New Blueprint
1. Create a new folder in `templates/blueprints/` (e.g., `momo-starter-fastify`).
2. Add a `package.json` at the root of that folder using `{{name}}` and `{{packageManager}}`.
3. Add any other files (e.g., `turbo.json`, `apps/`, `packages/`).
4. Update `getBlueprint` in `src/commands/core/create.ts` to include your new option.

### 3. Adding a New Component Flavor
1. Create a new folder in `templates/components/` (e.g., `with-python-api`).
2. Add necessary files. Usually, this includes a `package.json` and a `src/` directory.
3. Update `getComponentFlavor` in `src/commands/core/add.ts` to include your new flavor.

## 🛠 Local Development Note
Momo intelligently resolves the `templates/` directory by checking:
1. Relative to the CLI executable (for published packages).
2. The monorepo root (for local development).

This allows you to add and test templates locally without needing to re-bundle the CLI.
