import path from "node:path";
import { cancel, isCancel, select, text } from "@clack/prompts";
import type { Command } from "commander";
import color from "picocolors";
import { configManager } from "@/commands/config/config.js";
import { CreateProjectSchema } from "@/schemas/commands.schema.js";
import { getBaseConfig } from "@/templates/config-typescript/base.json.js";
import { getConfigPackageJson } from "@/templates/config-typescript/package.json.js";
import { getGitignore } from "@/templates/gitignore.js";
import { getMomoConfig } from "@/templates/momo.config.json.js";
import { getRootPackageJson, type PackageManager } from "@/templates/package.json.js";
import { getBaseTsConfig } from "@/templates/tsconfig.json.js";
import { getTurboJson } from "@/templates/turbo.json.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";
import { validators } from "@/utils/validators.js";

interface CreateProjectOptions {
  name?: string;
  cwd?: string;
  version?: string;
}

export async function createProject(args: CreateProjectOptions = {}) {
  // Validate args with Zod
  const validated = CreateProjectSchema.parse(args);
  let projectName = validated.name;
  let targetDir = "";

  // Guard: Prevent nested project creation
  if (projectUtils.isInsideProject()) {
    const root = projectUtils.findProjectRoot();
    logger.error(
      `Detected existing ${color.cyan("create-momo")} project at: ${color.underline(root || "")}`,
    );
    logger.warn(
      "Nesting projects is not recommended. Please run this command outside of an existing monorepo.",
    );
    process.exit(1);
  }

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

  // 4. Package Manager Selection
  const userAgent = process.env.npm_config_user_agent || "";
  let detectedPM: PackageManager = "pnpm";
  if (userAgent.includes("yarn")) detectedPM = "yarn";
  else if (userAgent.includes("bun")) detectedPM = "bun";
  else if (userAgent.includes("npm")) detectedPM = "npm";

  const packageManager = (await select({
    message: "Which package manager do you want to use?",
    initialValue: detectedPM,
    options: [
      { value: "bun", label: "Bun" },
      { value: "npm", label: "NPM" },
      { value: "pnpm", label: "PNPM" },
      { value: "yarn", label: "Yarn" },
    ],
  })) as PackageManager;

  if (isCancel(packageManager)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  // 5. Scaffolding
  const spinner = createSpinner("Scaffolding project with latest dependencies...");

  try {
    const _cleanScope = (scope as string).replace("@", "");

    await fileOps.ensureDir(targetDir);

    // ROOT package.json - always use latest for core tools
    await fileOps.writeJson(
      path.join(targetDir, "package.json"),
      getRootPackageJson(projectName, packageManager, validated.version || "0.2.0"),
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
    await fileOps.writeJson(path.join(targetDir, "tsconfig.json"), getBaseTsConfig());

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

    spinner.stop("Project scaffolded successfully!");

    logger.success(`\nProject created at ${color.underline(targetDir)}`);
    logger.info("\nNext steps:");
    if (targetDir !== process.cwd()) {
      logger.step(`  cd ${projectName}`);
    }
    logger.step(`  ${packageManager} install`);
    logger.step(`  ${packageManager} ${packageManager === "npm" ? "run " : ""}dev`);
  } catch (error) {
    spinner.stop("Failed to create project");
    logger.error((error as Error).message);
    process.exit(1);
  }
}

export function registerCreateCommand(program: Command, pkgVersion: string) {
  program
    .argument("[project-name]", "Name of the project directory")
    .action(async (projectName) => {
      await createProject({ name: projectName, version: pkgVersion });
    });
}
