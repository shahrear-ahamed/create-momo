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
import { execa } from "execa";
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

async function getStackSelections(skipPrompts: boolean = false) {
  if (skipPrompts) {
    return { frontend: "next-app", backend: "convex", ui: "shadcn" };
  }

  const frontend = await select({
    message: "choose your frontend framework",
    options: [
      { value: "next-app", label: "Next.js", hint: "App Router, Tailwind, TS" },
      { value: "react-vite", label: "React (Vite)", hint: "Fast and lightweight" },
      { value: "tanstack-start", label: "TanStack Start", hint: "Full-stack React Router" },
      { value: "expo", label: "Expo", hint: "React Native — iOS, Android, Web" },
      { value: "none", label: "None", hint: "Skip frontend" },
    ],
  });

  if (isCancel(frontend)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const backend = await select({
    message: "choose your backend / api layer",
    options: [
      { value: "convex", label: "Convex", hint: "Real-time backend-as-a-service" },
      { value: "node-express", label: "Express", hint: "Standard Node.js framework" },
      { value: "hono", label: "Hono", hint: "Ultrafast edge-ready framework" },
      { value: "fastify", label: "Fastify", hint: "High-performance Node.js" },
      { value: "nestjs", label: "NestJS", hint: "Enterprise-grade progressive Node.js" },
      { value: "none", label: "None", hint: "Skip backend" },
    ],
  });

  if (isCancel(backend)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const ui = await select({
    message: "choose your ui library",
    options: [
      { value: "shadcn", label: "Shadcn UI", hint: "Premium components with Tailwind" },
      { value: "none", label: "None", hint: "Skip UI library" },
    ],
  });

  if (isCancel(ui)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return {
    frontend: frontend === "none" ? null : (frontend as string),
    backend: backend === "none" ? null : (backend as string),
    ui: ui === "none" ? null : (ui as string),
  };
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
  const stacks = await getStackSelections(validated.yes);
  const pmVersion = await projectUtils.getPMVersion(packageManager);

  // Find template roots
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, "../templates"), // dist/ -> templates/
    path.resolve(__dirname, "../../../templates"), // src/commands/core -> templates/
  ];
  const templateBase = candidates.find((p) => fs.existsSync(p)) || candidates[0];

  const blueprintRoot = path.join(templateBase, "blueprints");
  const stackRoot = path.join(templateBase, "stacks");

  const spinner = createSpinner("Assembling your stack...");
  const momoVersion = await projectUtils.getMomoVersion();

  try {
    // 1. Initial Scaffold (Minimal structure)
    const baseBlueprint = path.join(blueprintRoot, "momo-starter-minimal");
    await templateEngine.copyTemplate(baseBlueprint, targetDir, {
      name: projectName,
      scope,
      packageManager,
      pmVersion,
      momoVersion,
      version: validated.version || "0.1.0",
    });

    // 2. Assemble Stacks (file-based templates)
    const selectedStacks = [
      { cat: "frontend", item: stacks.frontend, defaultName: "web" },
      {
        cat: "backend",
        item: stacks.backend,
        defaultName: stacks.backend === "convex" ? "convex" : "api",
      },
    ];

    for (const s of selectedStacks) {
      if (s.item) {
        const stackDir = path.join(stackRoot, s.cat, s.item);
        const momoPath = path.join(stackDir, "momo.json");
        if (fs.existsSync(momoPath)) {
          const mConfig = await fs.readJson(momoPath);
          const stackName = s.defaultName;
          const relativeTarget = mConfig.target.replace("{{name}}", stackName);
          const stackTargetDir = path.join(targetDir, relativeTarget);

          await templateEngine.copyTemplate(stackDir, stackTargetDir, {
            name: stackName,
            scope,
            projectName,
          });
        }
      }
    }

    spinner.stop("Project scaffolded successfully!");

    // 3. Post-scaffold: Dynamic Shadcn UI initialization
    if (stacks.ui === "shadcn" && stacks.frontend) {
      const frontendDir = path.join(targetDir, "apps/web");
      if (fs.existsSync(frontendDir)) {
        const shadcnSpinner = createSpinner("Initializing Shadcn UI...");
        try {
          await execa("npx", ["shadcn@latest", "init", "-y", "--cwd", frontendDir], {
            stdio: "pipe",
            cwd: targetDir,
          });
          shadcnSpinner.stop("Shadcn UI initialized!");
        } catch {
          shadcnSpinner.stop(
            color.yellow("Shadcn UI init skipped (run manually: npx shadcn@latest init)"),
          );
        }
      }
    }
    logger.success(`\nProject created at ${color.underline(targetDir)}`);
    logger.info("\nNext steps:");
    if (targetDir !== process.cwd()) logger.step(`  cd ${projectName}`);
    logger.step(`  ${packageManager} install`);
    logger.step(`  ${packageManager} dev`);
  } catch (error) {
    const err = error as Error;
    spinner.stop(`${color.red("Failed:")} Project creation halted.`);
    logger.error(`${color.bold("Reason:")} ${err.message}`);
    process.exit(1);
  }
}
