import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { cancel, isCancel, select, text } from "@clack/prompts";
import fs from "fs-extra";
import color from "picocolors";
import { configManager } from "@/commands/config/config.js";
import { CreateProjectSchema } from "@/schemas/commands.schema.js";
import type { CreateProjectOptions, PackageManager } from "@/types/index.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";
import { templateEngine } from "@/utils/template-engine.js";
import { validators } from "@/utils/validators.js";

async function getProjectName(initialName?: string): Promise<string> {
  let projectName = initialName;

  if (!projectName) {
    const name = await text({
      message: "What is the name of your monorepo?",
      placeholder: "my-momo-project",
      validate: (value) => (value === "." ? undefined : validators.projectName(value)),
    });

    if (isCancel(name)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    projectName = name as string;
  } else if (projectName !== ".") {
    const error = validators.projectName(projectName);
    if (error) {
      logger.error(`${color.bold("Invalid Project Name:")} ${error}`);
      logger.info(`Try a name that adheres to ${color.cyan("npm package naming")} conventions.`);
      process.exit(1);
    }
  }

  return projectName;
}

async function validateTargetDir(targetDir: string, projectName: string) {
  const isEmpty = await fileOps.isEmpty(targetDir);
  if (!isEmpty) {
    const overwrite = await select({
      message: `Directory "${projectName === "." ? "Current Directory" : projectName}" is not empty. Proceed?`,
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
}

async function getProjectScope(projectName: string): Promise<string> {
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

  return scope as string;
}

async function getPackageManager(): Promise<PackageManager> {
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

  return packageManager;
}

async function getBlueprint(initialBlueprint?: string): Promise<string> {
  if (initialBlueprint) return initialBlueprint;

  const blueprint = await select({
    message: "Which blueprint would you like to start with?",
    options: [
      { value: "momo-starter-minimal", label: "Minimal", hint: "Clean monorepo structure" },
      { value: "momo-starter-saas", label: "SaaS Starter", hint: "Next.js + UI + Shared Configs" },
    ],
  });

  if (isCancel(blueprint)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return blueprint as string;
}

// runScaffolding removed. Template engine handles this via blueprints.

export async function createProject(args: CreateProjectOptions = {}) {
  const validated = CreateProjectSchema.parse(args);

  if (projectUtils.isInsideProject()) {
    const root = projectUtils.findProjectRoot();
    logger.error(
      `${color.bold("Existing Project Detected:")} You are already inside a Momo project at:`,
    );
    logger.error(`  ${color.underline(root || "")}`);
    logger.info(
      `To create a new project, please move outside of ${color.cyan(path.basename(root || ""))}.`,
    );
    process.exit(1);
  }

  let projectName = await getProjectName(validated.name);
  let targetDir = "";

  if (projectName === ".") {
    targetDir = process.cwd();
    projectName = path.basename(targetDir);
  } else {
    targetDir = path.resolve(process.cwd(), projectName);
  }

  await validateTargetDir(targetDir, projectName);
  const scope = await getProjectScope(projectName);
  const packageManager = await getPackageManager();
  const blueprint = await getBlueprint(validated.blueprint);
  const pmVersion = await projectUtils.getPMVersion(packageManager);

  // Find template directory (support both local monorepo and published package)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  let templateRoot = path.resolve(__dirname, "../../../../../templates/blueprints");

  // If not found in monorepo root, check internal package (for future bundling)
  if (!fs.existsSync(templateRoot)) {
    templateRoot = path.resolve(__dirname, "../templates/blueprints");
  }

  const blueprintDir = path.join(templateRoot, blueprint);

  if (!fs.existsSync(blueprintDir)) {
    logger.error(
      `${color.bold("Blueprint Not Found:")} Could not find blueprint at ${blueprintDir}`,
    );
    process.exit(1);
  }

  const spinner = createSpinner("Scaffolding project with latest dependencies...");
  try {
    await templateEngine.copyTemplate(blueprintDir, targetDir, {
      name: projectName,
      scope,
      packageManager,
      pmVersion,
      version: validated.version || "0.5.1",
    });

    spinner.stop("Project scaffolded successfully!");
    logger.success(`\nProject created at ${color.underline(targetDir)}`);
    logger.info("\nNext steps:");
    if (targetDir !== process.cwd()) logger.step(`  cd ${projectName}`);
    logger.step(`  ${packageManager} install`);
    logger.step(`  ${packageManager} ${packageManager === "npm" ? "run " : ""}dev`);
  } catch (error) {
    const err = error as Error;
    spinner.stop(`${color.red("Failed:")} Project creation halted.`);
    logger.error(`${color.bold("Reason:")} ${err.message}`);

    if (err.message.includes("permission denied")) {
      logger.info(
        `${color.yellow("Tip:")} Check your folder permissions or try running with elevated privileges.`,
      );
    }

    process.exit(1);
  }
}
