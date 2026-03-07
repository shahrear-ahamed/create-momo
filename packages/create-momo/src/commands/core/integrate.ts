import { configManager } from "@/commands/config/config.js";
import { COMMANDS, DESCRIPTIONS, INTEGRATE_ACTION_FLAGS } from "@/constants/commands.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { templateEngine } from "@/utils/template-engine.js";
import { workspaceUtils } from "@/utils/workspace.js";
import { cancel, confirm, isCancel, multiselect, select } from "@clack/prompts";
import type { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import color from "picocolors";
import { addComponent } from "./add.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function detectWorkspaceMode(rootDir: string): Promise<"mono" | "standalone"> {
  const hasPnpmWorkspace = fs.existsSync(path.join(rootDir, "pnpm-workspace.yaml"));
  const rootPkgPath = path.join(rootDir, "package.json");
  let hasWorkspaces = false;

  if (fs.existsSync(rootPkgPath)) {
    const pkg = await fs.readJson(rootPkgPath);
    hasWorkspaces = !!pkg.workspaces;
  }

  return hasPnpmWorkspace || hasWorkspaces ? "mono" : "standalone";
}

async function detectFramework(dir: string): Promise<string> {
  const pkgPath = path.join(dir, "package.json");
  let deps: Record<string, string> = {};

  if (fs.existsSync(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    deps = { ...pkg.dependencies, ...pkg.devDependencies };
  }

  const checkDeps = (d: Record<string, string>) => {
    if (d["@tanstack/start"]) return "start";
    if (d["@tanstack/react-router"]) return "react-router";
    if (d["next"]) return "next";
    if (d["vite"]) return "vite";
    if (d["astro"]) return "astro";
    return null;
  };

  const direct = checkDeps(deps);
  if (direct) return direct;

  // Check apps directory if in mono mode
  const appsDir = path.join(dir, "apps");
  if (fs.existsSync(appsDir)) {
    const apps = await fs.readdir(appsDir);
    for (const app of apps) {
      const appPkgPath = path.join(appsDir, app, "package.json");
      if (fs.existsSync(appPkgPath)) {
        const appPkg = await fs.readJson(appPkgPath);
        const appDeps = { ...appPkg.dependencies, ...appPkg.devDependencies };
        const found = checkDeps(appDeps);
        if (found) return found;
      }
    }
  }

  return "next"; // Default
}

async function integrateShadcn(options: any = {}) {
  const rootDir = process.cwd();
  const mode = await detectWorkspaceMode(rootDir);
  const config = await configManager.load();
  const scope = config.packageScope || config.scope || "@momo";
  const framework = await detectFramework(rootDir);

  logger.info(
    `\n${color.blue("Shadcn UI Integration:")} Detected ${color.bold(mode)} mode for ${color.cyan(framework)}... 🎨`,
  );

  if (mode === "mono") {
    await integrateShadcnMono(rootDir, scope, framework, options);
  } else {
    await integrateShadcnStandalone(rootDir, framework, options);
  }
}

async function integrateShadcnMono(
  rootDir: string,
  scope: string,
  framework: string,
  options: any,
) {
  const uiPkgName = "ui";
  const uiDir = path.join(rootDir, "packages", uiPkgName);

  // 1. Ensure shared UI package exists
  if (!fs.existsSync(uiDir)) {
    logger.info(`Creating ${color.cyan(`packages/${uiPkgName}`)} for shared components...`);
    await addComponent("package", { package: uiPkgName, flavor: "shadcn/ui-shared" }, uiPkgName);
  }

  // 2. Run shadcn init in shared UI package
  if (!fs.existsSync(path.join(uiDir, "components.json"))) {
    try {
      logger.step("Initializing Shadcn v4 with native monorepo support...");
      await execa(
        "pnpm",
        [
          "dlx",
          "shadcn@latest",
          "init",
          "-y",
          "--monorepo",
          "--preset",
          "radix-nova",
          "--template",
          framework,
          "--cwd",
          uiDir,
        ],
        { stdio: "inherit" },
      );
      logger.success("Shadcn UI initialized with premium radix-nova preset!");
    } catch (error) {
      logger.error(`Failed to initialize Shadcn in shared package: ${(error as Error).message}`);
      process.exit(1);
    }
  } else {
    logger.info(
      `${color.dim("ℹ")} Shadcn already initialized in ${color.cyan(`packages/${uiPkgName}`)}`,
    );
  }

  // 3. Select apps to integrate with
  const workspaces = await workspaceUtils.discoverWorkspaces(rootDir);
  const apps = workspaces.filter((ws) => ws.type === "app");

  if (apps.length === 0) {
    logger.warn("No apps found in /apps. Skipping app-level integration.");
    return;
  }

  let selectedApps: string[] = [];

  if (options.to && Array.isArray(options.to)) {
    selectedApps = options.to;
  } else if (options.yes) {
    selectedApps = apps.map((a) => path.basename(a.path));
  } else {
    const selections = await multiselect({
      message: "Which apps would you like to integrate with Shadcn?",
      options: apps.map((app) => ({
        value: path.basename(app.path),
        label: path.basename(app.path),
      })),
      required: false,
    });

    if (isCancel(selections)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    selectedApps = selections as string[];
  }

  if (selectedApps.length === 0) {
    logger.info("No apps selected for integration.");
    return;
  }

  // 4. For each selected app, write the components.json pointing to shared UI
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, "../templates"),
    path.resolve(__dirname, "../../../templates"),
  ];
  const baseDir = candidates.find((p) => fs.existsSync(p)) || candidates[0];
  const registryRoot = path.join(path.dirname(baseDir), "registry");
  const nextjsTemplateDir = path.join(registryRoot, "integrate", "shadcn", "next-js");

  for (const appName of selectedApps) {
    const appDir = path.join(rootDir, "apps", appName);
    if (!fs.existsSync(appDir)) {
      logger.warn(`App ${color.bold(appName)} not found at apps/${appName}. Skipping.`);
      continue;
    }

    const spinner = createSpinner(`Linking Shadcn to ${color.cyan(appName)}...`);
    try {
      await templateEngine.copyTemplate(nextjsTemplateDir, appDir, {
        scope,
        uiPkgName,
      });
      spinner.stop(`Linked Shadcn to ${color.bold(appName)}!`);
    } catch (error) {
      spinner.stop(`${color.red("Failed:")} ${(error as Error).message}`);
    }
  }

  logger.success("\nIntegration complete! 🛡️⚡️");
  logger.info(`Next steps:`);
  logger.step(`  momo add shadcn:button        (Adds to shared UI via momo add)`);
  logger.step(`  momo integrate shadcn         (To add more apps)`);
}

async function integrateShadcnStandalone(rootDir: string, framework: string, _options: any) {
  if (fs.existsSync(path.join(rootDir, "components.json"))) {
    logger.info(`${color.dim("ℹ")} Shadcn already initialized in this project.`);
    return;
  }

  try {
    logger.step(`Initializing Shadcn v4 for ${color.cyan(framework)}...`);
    await execa(
      "pnpm",
      ["dlx", "shadcn@latest", "init", "-y", "--preset", "radix-nova", "--template", framework],
      { stdio: "inherit", cwd: rootDir },
    );

    // Optional: Overwrite with our premium standalone template if we want to enforce specific styles
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
      path.resolve(__dirname, "../templates"),
      path.resolve(__dirname, "../../../templates"),
    ];
    const baseDir = candidates.find((p) => fs.existsSync(p)) || candidates[0];
    const registryRoot = path.join(path.dirname(baseDir), "registry");
    const tStackTemplateDir = path.join(registryRoot, "integrate", "shadcn", "t-stack");

    if (fs.existsSync(tStackTemplateDir)) {
      await templateEngine.copyTemplate(tStackTemplateDir, rootDir, {});
    }

    logger.success("Shadcn UI initialized successfully with premium preset! 🛡️⚡️");
  } catch (error) {
    logger.error(`Failed to initialize Shadcn: ${(error as Error).message}`);
    process.exit(1);
  }
}

// ─── Command Registration ────────────────────────────────────────────────────

async function integrateConvex() {
  const rootDir = process.cwd();
  const mode = await detectWorkspaceMode(rootDir);
  await configManager.load();

  logger.info(`\n${color.blue("Convex Integration:")} Setting up real-time backend... 🚀`);

  if (mode === "mono") {
    const convexDir = path.join(rootDir, "packages", "convex");
    if (!fs.existsSync(convexDir)) {
      logger.step(`Creating ${color.cyan("packages/convex")}...`);

      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const candidates = [
        path.resolve(__dirname, "../templates"),
        path.resolve(__dirname, "../../../templates"),
      ];
      const baseDir = candidates.find((p) => fs.existsSync(p)) || candidates[0];
      const registryRoot = path.join(path.dirname(baseDir), "registry");
      const backendTemplateDir = path.join(registryRoot, "integrate", "backend");

      const config = await configManager.load();
      const scope = config.packageScope || config.scope || "@momo";

      await templateEngine.copyTemplate(backendTemplateDir, convexDir, {
        name: "convex",
        scope,
        projectName: path.basename(rootDir),
      });
    } else {
      logger.info(`${color.dim("ℹ")} Convex already exists in ${color.cyan("packages/convex")}`);
    }
  } else {
    logger.step("Initializing Convex in standalone mode...");
    try {
      await execa("npm", ["install", "convex"], { stdio: "inherit", cwd: rootDir });
      await execa("npx", ["convex", "dev", "--until-success"], { stdio: "inherit", cwd: rootDir });
    } catch (error) {
      logger.error(`Failed to initialize Convex: ${(error as Error).message}`);
    }
  }

  logger.success("\nConvex integration complete! ⚡️");
}

async function integrateEnv() {
  const rootDir = process.cwd();
  await configManager.load();

  logger.info(`\n${color.blue("Env Integration:")} Scaffolding type-safe environment... 🔐`);

  const targetPath = path.join(rootDir, "packages/env");
  if (fs.existsSync(targetPath)) {
    const overwrite = await confirm({
      message: "packages/env already exists. overwrite?",
      initialValue: false,
    });
    if (isCancel(overwrite) || !overwrite) return;
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, "../templates"),
    path.resolve(__dirname, "../../../templates"),
  ];
  const baseDir = candidates.find((p) => fs.existsSync(p)) || candidates[0];
  const registryRoot = path.join(path.dirname(baseDir), "registry");
  const templatePath = path.join(registryRoot, "integrate", "env");

  if (!fs.existsSync(templatePath)) {
    logger.error(`${color.red("Error:")} Env template not found at ${templatePath}`);
    return;
  }

  const spinner = createSpinner("Setting up T3 environment package...");
  try {
    const config = await configManager.load();
    const scope = config.packageScope || config.scope || "@momo";

    await fs.ensureDir(targetPath);
    await fs.copy(templatePath, targetPath);

    // Replace scope in package.json
    const pkgPath = path.join(targetPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      let pkgContent = await fs.readFile(pkgPath, "utf-8");
      pkgContent = pkgContent.replace("{{scope}}", scope);
      await fs.writeFile(pkgPath, pkgContent);
    }

    spinner.stop("T3 Env package scaffolded successfully! 🛡️⚡️");
    logger.info(
      "\nNext steps: Run 'pnpm install' and update your apps to import from '@momo/env'.",
    );
  } catch (error) {
    spinner.stop(`${color.red("Failed:")} ${(error as Error).message}`);
  }
}

// ─── Command Registration ────────────────────────────────────────────────────

export function registerIntegrateCommand(program: Command) {
  const integrate = program
    .command(COMMANDS.integrate)
    .description(DESCRIPTIONS.integrate)
    .action(async () => {
      const type = await select({
        message: "What would you like to integrate?",
        options: [
          { value: "shadcn", label: "Shadcn UI", hint: "Premium component system" },
          { value: "convex", label: "Convex", hint: "Real-time backend-as-a-service" },
          { value: "env", label: "T3 Env", hint: "Type-safe environment variables" },
          { value: "nextjs", label: "Next.js extras", hint: "coming soon" },
          { value: "tanstack", label: "TanStack extras", hint: "coming soon" },
        ],
      });

      if (isCancel(type)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      if (type === "shadcn") {
        await integrateShadcn();
      } else if (type === "convex") {
        await integrateConvex();
      } else if (type === "env") {
        await integrateEnv();
      } else {
        logger.info(
          `${color.yellow("Coming Soon:")} Integration for ${color.bold(type as string)} is under development.`,
        );
      }
    });

  integrate
    .command(COMMANDS.integrateShadcn)
    .description(DESCRIPTIONS.integrateShadcn)
    .option(INTEGRATE_ACTION_FLAGS.yes.flag, INTEGRATE_ACTION_FLAGS.yes.description)
    .option(INTEGRATE_ACTION_FLAGS.to.flag, INTEGRATE_ACTION_FLAGS.to.description)
    .action(async (options) => {
      // Support space-separated strings even if already in an array (variadic)
      if (options.to) {
        if (Array.isArray(options.to)) {
          options.to = options.to.flatMap((t: string) => t.split(" "));
        } else if (typeof options.to === "string") {
          options.to = options.to.split(" ");
        }
      }
      await integrateShadcn(options);
    });

  integrate
    .command(COMMANDS.integrateConvex)
    .description(DESCRIPTIONS.integrateConvex)
    .action(async () => await integrateConvex());

  integrate
    .command(COMMANDS.integrateNextjs)
    .description(DESCRIPTIONS.integrateNextjs)
    .action(() =>
      logger.info(
        `${color.yellow("Coming Soon:")} Next.js integration will be available in v0.8.0`,
      ),
    );

  integrate
    .command("env")
    .description("Integrate T3 Env for type-safe environment variables")
    .action(async () => await integrateEnv());

  integrate
    .command(COMMANDS.integrateTanstack)
    .description(DESCRIPTIONS.integrateTanstack)
    .action(() =>
      logger.info(
        `${color.yellow("Coming Soon:")} TanStack integration will be available in v0.8.0`,
      ),
    );
}
