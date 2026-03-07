---
"create-momo": patch
---

Remove `momo add` command and consolidate functionality into `momo install`

The `momo add` command has been removed in favor of the more streamlined `momo install` command. All functionality for adding dependencies and creating new workspaces has been consolidated into `momo install`, which now provides:

- Direct package installation with interactive target selection
- Ability to create new apps/packages on-the-fly during installation
- Improved prompts for devDependency selection
- Better workspace discovery and management

**Breaking Change**: Users relying on `momo add` should migrate to `momo install` for dependency management and workspace operations.

**Migration**:

- `momo add zod` → `momo install zod`
- Workspace creation is now handled interactively through `momo install` when selecting "Create new app/package"

Related changes:

- Removed `add.ts` command file and associated tests
- Updated README documentation to reflect new command structure
- Consolidated dependency installation logic into `install.ts`
- Updated integration flows to work without `momo add`
