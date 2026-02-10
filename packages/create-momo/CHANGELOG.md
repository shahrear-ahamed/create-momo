# create-momo

## 0.1.0

### Minor Changes

- e5d665e: Initial release of `create-momo`, a modern CLI tool for scaffolding and managing monorepo projects.

  Key features included in this release:
  - **Project Scaffolding**: Quick initialization of Turborepo-based monorepo projects.
  - **Component Management**: Interactive `add` command to scaffold applications in `/apps` and packages in `/packages` with appropriate TypeScript configurations.
  - **Modern CLI UI**: A vibrant, user-friendly interface featuring top-to-bottom gradients and interactive prompts powered by `@clack/prompts`.
  - **Built-in Workflows**:
    - `setup`: Automated configuration for npm publishing, open-source documentation (LICENSE, CONTRIBUTING), and proprietary project settings.
    - `deploy`: Initial deployment hooks and `push` shortcut.
    - `config`: Global and project-level configuration management.
  - **Utility Tools**:
    - `doctor`: Health checks for project dependencies and environment.
    - `list`: Browse available component flavors and blueprints.
  - **CI/CD Integration**: Robust GitHub Actions workflows for continuous integration (`ci.yml`), official releases (`release.yml`), and preview/snapshot releases (`snapshot.yml`).
