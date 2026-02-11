import path from "node:path";
import { fileURLToPath } from "node:url";
import { cancel, isCancel, select, text } from "@clack/prompts";
import fs from "fs-extra";
import color from "picocolors";
import { configManager } from "@/commands/config.js";
import { getBaseConfig } from "@/templates/config-typescript/base.json.js";
import { getConfigPackageJson } from "@/templates/config-typescript/package.json.js";
import { getGitignore } from "@/templates/gitignore.js";
import { getMomoConfig } from "@/templates/momo.config.json.js";
import {
  getRootPackageJson,
  type PackageManager,
} from "@/templates/package.json.js";
import { getBaseTsConfig } from "@/templates/tsconfig.json.js";
import { getTurboJson } from "@/templates/turbo.json.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { validators } from "@/utils/validators.js";

// Read package.json dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgPath = path.resolve(__dirname, "../../package.json");
const pkg = fs.readJsonSync(pkgPath);

export async function createProject(
  args: { name?: string; cwd?: string } = {},
) {
  let projectName = args.name;
  let targetDir = "";

  // 1. Ask for project name if not provided
  if (!projectName) {
    const name = await text({
      message: "What is the name of your monorepo?",
      placeholder: "my-momo-project",
      validate: (value) => {
        if (value === ".") return; // Allow .
        return validators.projectName(value);
      },
    });

    if (isCancel(name)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    projectName = name as string;
  } else {
    // Validate provided name (allow . for current dir)
    if (projectName !== ".") {
      const validationError = validators.projectName(projectName);
      if (validationError) {
        logger.error(`Invalid project name: ${validationError}`);
        process.exit(1);
      }
    }
  }

  // Resolve target directory
  if (projectName === ".") {
    targetDir = process.cwd();
    // If using current dir, use the folder name as the project name in package.json
    projectName = path.basename(targetDir);
  } else {
    targetDir = path.resolve(process.cwd(), projectName);
  }

  // 2. Check if directory exists and is empty
  const isEmpty = await fileOps.isEmpty(targetDir);
  if (!isEmpty) {
    const overwrite = await select({
      message: `Directory "${projectName === "." ? "Current Directory" : projectName}" is not empty. How would you like to proceed?`,
      options: [
        { value: "cancel", label: "Cancel operation" },
        { value: "ignore", label: "Ignore (files might be overwritten)" },
      ],
    });

    if (isCancel(overwrite) || overwrite === "cancel") {
      cancel("Operation cancelled.");
      process.exit(0);
    }
  }

  // 3. Configuration (Scope)
  const config = await configManager.load();
  const defaultScope =
    config.packageScope ||
    config.scope ||
    `@${projectName.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}`;

  const scope = await text({
    message: "What is the package scope?",
    placeholder: "@momo",
    initialValue: defaultScope,
    validate: validators.scopeName,
  });

  if (isCancel(scope)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  // 4. Package Manager Detection
  const userAgent = process.env.npm_config_user_agent || "";
  let packageManager: PackageManager = "pnpm";

  if (userAgent.includes("yarn")) packageManager = "yarn";
  else if (userAgent.includes("bun")) packageManager = "bun";
  else if (userAgent.includes("npm")) packageManager = "npm";

  // 5. Scaffolding
  const spinner = createSpinner("Scaffolding project...");

  try {
    const _cleanScope = (scope as string).replace("@", "");

    await fileOps.ensureDir(targetDir);

    // ROOT package.json
    await fileOps.writeJson(
      path.join(targetDir, "package.json"),
      getRootPackageJson(projectName, packageManager, pkg.version),
    );

    // Workspace Config (Only for pnpm)
    if (packageManager === "pnpm") {
      await fileOps.writeFile(
        path.join(targetDir, "pnpm-workspace.yaml"),
        `packages:
  - "apps/*"
  - "packages/*"
`,
      );
    }

    // turbo.json
    await fileOps.writeJson(path.join(targetDir, "turbo.json"), getTurboJson());

    // tsconfig.json (Base)
    await fileOps.writeJson(
      path.join(targetDir, "tsconfig.json"),
      getBaseTsConfig(),
    );

    // .gitignore
    await fileOps.writeFile(path.join(targetDir, ".gitignore"), getGitignore());

    // momo.config.json
    await fileOps.writeJson(
      path.join(targetDir, "momo.config.json"),
      getMomoConfig(scope as string, packageManager),
    );

    // Create folders
    await fileOps.ensureDir(path.join(targetDir, "apps"));
    await fileOps.ensureDir(path.join(targetDir, "packages"));

    // 6. Scaffold config-typescript package
    const configDir = path.join(targetDir, "packages", "config-typescript");
    await fileOps.ensureDir(configDir);
    await fileOps.writeJson(
      path.join(configDir, "package.json"),
      getConfigPackageJson(scope as string),
    );
    await fileOps.writeJson(path.join(configDir, "base.json"), getBaseConfig());

    spinner.stop("Project scouted successfully!");

    logger.success(`\nProject created at ${color.underline(targetDir)}`);
    logger.info("\nNext steps:");
    if (targetDir !== process.cwd()) {
      logger.step(`  cd ${args.name || projectName}`);
    }
    logger.step(`  ${packageManager} install`);
    logger.step(
      `  ${packageManager} ${packageManager === "npm" ? "run " : ""}dev`,
    );
  } catch (error) {
    spinner.stop("Failed to create project");
    logger.error((error as Error).message);
    process.exit(1);
  }
}
