# Contributing to create-momo

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project is handled.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)

## Code of Conduct

This project and everyone participating in it is governed by the
[create-momo Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/shahrear-ahamed/create-momo.git
   cd create-momo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This allows us to automatically generate changelogs and version bumps.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. **Add a changeset**: Run `pnpm changeset` and follow the prompts. This is required for any change that should trigger a new release.
7. Issue that pull request!

## Release Workflow

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and releases.

1. **Commit a changeset**: When your feature is ready, run `pnpm changeset`. This creates a small markdown file in the `.changeset` directory.
2. **Merge to main**: Once your PR is merged to `main`, a GitHub Action will automatically create or update a "Version Packages" Pull Request.
3. **Publish**: When you merge the "Version Packages" PR, the GitHub Action will automatically publish the new version(s) to npm and create matching GitHub releases.
