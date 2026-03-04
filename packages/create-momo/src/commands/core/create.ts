import { configManager } from "@/commands/config/config.js";
import { runAdoptFlow, runMigrateFlow } from "@/commands/lifecycle/adopt.js";
import { CreateProjectSchema } from "@/schemas/commands.schema.js";
import type { CreateProjectOptions, PackageManager } from "@/types/index.js";
import { showLogo } from "@/utils/cli-utils.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";
import { templateEngine } from "@/utils/template-engine.js";
import { validators } from "@/utils/validators.js";
import { cancel, isCancel, select, text } from "@clack/prompts";
import fs from "fs-extra";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import color from "picocolors";

async function getProjectName(initialName?: string): Promise<string> {
  let projectName = initialName;

  if (!projectName) {
    const name = await text({
      message: "what is the name of your monorepo?",
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
      message: `directory "${projectName === "." ? "current directory" : projectName}" is not empty. proceed?`,
      options: [
        { value: "cancel", label: "cancel operation" },
        { value: "ignore", label: "ignore (files might be overwritten)" },
      ],
    });

    if (isCancel(overwrite) || overwrite === "cancel") {
      cancel("Operation cancelled.");
      process.exit(0);
    }
  }
}

async function getProjectScope(projectName: string, initialScope?: string): Promise<string> {
  if (initialScope) return initialScope;
  const config = await configManager.load();
  const defaultScope =
    config.packageScope ||
    config.scope ||
    `@${projectName.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}`;

  const scope = await text({
    message: "what is the package scope?",
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

async function getPackageManager(initialManager?: PackageManager): Promise<PackageManager> {
  if (initialManager) return initialManager;
  const userAgent = process.env.npm_config_user_agent || "";
  let detectedPM: PackageManager = "pnpm";
  if (userAgent.includes("yarn")) detectedPM = "yarn";
  else if (userAgent.includes("bun")) detectedPM = "bun";
  else if (userAgent.includes("npm")) detectedPM = "npm";

  const packageManager = (await select({
    message: "which package manager do you want to use?",
    initialValue: detectedPM,
    options: [
      { value: "bun", label: "bun" },
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm" },
      { value: "yarn", label: "yarn" },
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
    message: "which blueprint would you like to start with?",
    options: [
      { value: "momo-starter-blank", label: "blank", hint: "Empty monorepo, no apps or packages" },
      { value: "momo-starter-minimal", label: "minimal", hint: "Clean monorepo structure" },
      { value: "momo-starter-saas", label: "saas starter", hint: "Next.js + UI + Shared Configs" },
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
  showLogo();
  const validated = CreateProjectSchema.parse(args);

  if (projectUtils.isInsideProject()) {
    const root = projectUtils.findProjectRoot();
    logger.warn(
      `\n${color.bold("Existing Momo Project Detected:")} You are already inside a Momo project at:`,
    );
    logger.warn(`  ${color.underline(root || "")}`);

    logger.info("Momo is already tracking your project. To run a health check, try `momo doctor`.");

    const repair = await select({
      message: "What would you like to do?",
      options: [
        { value: "cancel", label: "Cancel (Exit)" },
        { value: "reanalyze", label: "Re-analyze / Repair project (Adopt Flow)" },
      ],
    });

    if (repair === "cancel" || isCancel(repair)) {
      process.exit(0);
    }

    // Continue to adopt flow to reanalyze
    const targetDir = root || process.cwd();
    const pName = path.basename(targetDir);
    const pScope = await getProjectScope(pName, validated.scope);
    const pManager = await getPackageManager(validated.manager);
    await runAdoptFlow(targetDir, pName, pScope, pManager);
    return;
  }

  let projectName = await getProjectName(validated.name);
  let targetDir = "";

  if (projectName === ".") {
    targetDir = process.cwd();
    projectName = path.basename(targetDir);
  } else {
    targetDir = path.resolve(process.cwd(), projectName);
  }

  // Smart Detection for in-place adoption
  if (projectName === path.basename(process.cwd()) && !(await fileOps.isEmpty(targetDir))) {
    const hasPnpmWorkspace = fs.existsSync(path.join(targetDir, "pnpm-workspace.yaml"));
    let hasPackageJsonWorkspaces = false;
    let isPlainPackage = false;

    const rootPkgPath = path.join(targetDir, "package.json");
    if (fs.existsSync(rootPkgPath)) {
      const pkg = await fs.readJson(rootPkgPath);
      hasPackageJsonWorkspaces = !!pkg.workspaces;
      isPlainPackage = true;
    }

    if (hasPnpmWorkspace || hasPackageJsonWorkspaces) {
      // It's already a monorepo
      const scope = await getProjectScope(projectName, validated.scope);
      const packageManager = await getPackageManager(validated.manager);
      await runAdoptFlow(targetDir, projectName, scope, packageManager);
      return;
    } else if (isPlainPackage) {
      // It's a standard single-repo
      const scope = await getProjectScope(projectName, validated.scope);
      const packageManager = await getPackageManager(validated.manager);
      await runMigrateFlow(targetDir, projectName, scope, packageManager);
      return;
    }
  }

  await validateTargetDir(targetDir, projectName);
  const scope = await getProjectScope(projectName, validated.scope);
  const packageManager = await getPackageManager(validated.manager);
  const blueprint = await getBlueprint(validated.blueprint);
  const pmVersion = await projectUtils.getPMVersion(packageManager);

  // Find template directory (support both local monorepo and published package)
  // Try multiple candidates: dist/ is flat (3 up), src/commands/core/ needs 5 up, fallback to ../templates for bundled publish
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, "../templates/blueprints"), // internal to package (dist/ -> templates/)
    path.resolve(__dirname, "../../../templates/blueprints"), // dev mode (src/commands/core/ -> templates/)
  ];
  let templateRoot = candidates.find((p) => fs.existsSync(p)) || candidates[0];

  const blueprintDir = path.join(templateRoot, blueprint);

  if (!fs.existsSync(blueprintDir)) {
    logger.error(
      `${color.bold("Blueprint Not Found:")} Could not find blueprint at ${blueprintDir}`,
    );
    process.exit(1);
  }

  const spinner = createSpinner("Scaffolding project with latest dependencies...");
  const momoVersion = await projectUtils.getMomoVersion();

  try {
    await templateEngine.copyTemplate(blueprintDir, targetDir, {
      name: projectName,
      scope,
      packageManager,
      pmVersion,
      momoVersion,
      version: validated.version || "0.1.0",
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
