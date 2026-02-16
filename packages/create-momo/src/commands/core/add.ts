import path from "node:path";
import { cancel, isCancel, select, text } from "@clack/prompts";
import type { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import color from "picocolors";
import { configManager } from "@/commands/config/config.js";
import { ADD_DEP_FLAGS, COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { AddComponentSchema } from "@/schemas/commands.schema.js";
import { getBaseConfig } from "@/templates/config-typescript/base.json.js";
import { getNextjsConfig } from "@/templates/config-typescript/nextjs.json.js";
import { getNodeConfig } from "@/templates/config-typescript/node.json.js";
import { getConfigPackageJson } from "@/templates/config-typescript/package.json.js";
import { getReactConfig } from "@/templates/config-typescript/react.json.js";
import type { AddDepOptions, AddOptions } from "@/types/index.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { validators } from "@/utils/validators.js";
import { workspaceUtils } from "@/utils/workspace.js";

export async function addComponent(type?: string, options: AddOptions = {}) {
  // Validate with Zod
  const validated = AddComponentSchema.parse({ type, options });
  let componentType = validated.type;

  // 1. Determine Type (App vs Package)
  if (!componentType && !validated.options?.app && !validated.options?.package) {
    const selectedType = await select({
      message: "What do you want to add?",
      options: [
        {
          value: "app",
          label: "Application (in /apps)",
          hint: "Next.js, Vite, etc.",
        },
        {
          value: "package",
          label: "Package (in /packages)",
          hint: "Shared UI, utils, etc.",
        },
        {
          value: "dep",
          label: "Dependency",
          hint: "Install a package (main or dev)",
        },
      ],
    });

    if (isCancel(selectedType)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    componentType = selectedType as string;

    // If it's a dependency, delegate to the dependency handler
    if (componentType === "dep") {
      const packageName = await text({
        message: "What is the name of the package?",
        placeholder: "zod",
      });
      if (isCancel(packageName)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      return addDependency(packageName as string, {});
    }
  } else {
    // Infer from flags
    if (validated.options?.app) componentType = "app";
    if (validated.options?.package) componentType = "package";
  }

  // 2. Prompt for Name
  const name = await text({
    message: `What is the name of your new ${componentType}?`,
    placeholder: componentType === "app" ? "web" : "ui",
    validate: (val) => {
      return validators.projectName(val);
    },
  });

  if (isCancel(name)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const componentName = name as string;
  const targetRoot = componentType === "app" ? "apps" : "packages";
  const targetDir = path.join(process.cwd(), targetRoot, componentName);

  // 3. Prompt for Flavor
  const flavor = await select({
    message: `Select the flavor for your ${componentType}`,
    options: [
      { value: "base", label: "Vanilla / Base" },
      { value: "nextjs", label: "Next.js" },
      { value: "react", label: "React (Vite)" },
      { value: "node", label: "Node.js / Express" },
    ],
  });

  if (isCancel(flavor)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  // 4. Scaffolding
  const spinner = createSpinner(`Creating ${componentType}...`);

  try {
    await fileOps.ensureDir(targetDir);

    // Basic package.json
    await fileOps.writeJson(path.join(targetDir, "package.json"), {
      name: componentName,
      version: "0.0.0",
      private: true,
      scripts: {
        build: "echo build",
        dev: "echo dev",
      },
    });

    // 4.1 Ensure config-typescript exists and has the requested flavor
    const configPkgDir = path.join(process.cwd(), "packages", "config-typescript");
    const flavorFile = path.join(configPkgDir, `${flavor}.json`);

    // Existence checks
    const configExists = !(await fileOps.isEmpty(configPkgDir));
    if (!configExists) {
      await fileOps.ensureDir(configPkgDir);
      await fileOps.writeJson(
        path.join(configPkgDir, "package.json"),
        getConfigPackageJson("@momo"),
      );
      await fileOps.writeJson(path.join(configPkgDir, "base.json"), getBaseConfig());
    }

    // Check flavor file
    const flavorExists = await (async () => {
      try {
        await fileOps.readJson(flavorFile);
        return true;
      } catch {
        return false;
      }
    })();

    if (!flavorExists && flavor !== "base") {
      let configContent: Record<string, unknown> | undefined;
      if (flavor === "nextjs") configContent = getNextjsConfig();
      else if (flavor === "react") configContent = getReactConfig();
      else if (flavor === "node") configContent = getNodeConfig();

      if (configContent) {
        await fileOps.writeJson(flavorFile, configContent);
        logger.info(`Added ${color.cyan(`${flavor}.json`)} to shared config.`);
      }
    }

    // Add tsconfig to component
    const extendPath = `../../packages/config-typescript/${flavor}.json`;
    await fileOps.writeJson(path.join(targetDir, "tsconfig.json"), {
      extends: extendPath,
      compilerOptions: {
        outDir: "dist",
        rootDir: "src",
      },
      include: ["src"],
      exclude: ["node_modules", "dist"],
    });

    // Add src folder
    await fileOps.ensureDir(path.join(targetDir, "src"));

    spinner.stop(`${componentType === "app" ? "Application" : "Package"} added successfully!`);

    logger.success(`\nCreated ${color.bold(componentName)} in ${color.underline(targetDir)}`);
  } catch (error) {
    spinner.stop("Failed to add component");
    logger.error((error as Error).message);
    process.exit(1);
  }
}

async function addDependency(packageName: string, options: AddDepOptions) {
  const config = await configManager.load();
  const packageManager = config.manager || "pnpm";

  // Guard: Must be inside a momo project
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, "momo.config.json");
  if (!fs.existsSync(configPath)) {
    logger.error(
      `Not inside a ${color.cyan("create-momo")} project. Run this command from the project root.`,
    );
    process.exit(1);
  }

  // Determine target
  let target: string | null = null;
  let isWorkspaceRoot = options.root || false;

  if (options.app) {
    const workspace = await workspaceUtils.findWorkspace(options.app, rootDir);
    if (!workspace || workspace.type !== "app") {
      logger.error(`App ${color.cyan(options.app)} not found.`);
      process.exit(1);
    }
    target = workspace.name;
  } else if (options.pkg) {
    const workspace = await workspaceUtils.findWorkspace(options.pkg, rootDir);
    if (!workspace || workspace.type !== "package") {
      logger.error(`Package ${color.cyan(options.pkg)} not found.`);
      process.exit(1);
    }
    target = workspace.name;
  } else if (!isWorkspaceRoot) {
    // Interactive selection
    const workspaces = await workspaceUtils.discoverWorkspaces(rootDir);
    if (workspaces.length === 0) {
      logger.warn("No apps or packages found. Adding to workspace root.");
      isWorkspaceRoot = true;
    } else {
      const selections = workspaces.map((ws) => ({
        value: ws.name,
        label: `${ws.name} ${color.dim(`(${ws.type})`)}`,
      }));

      selections.push({
        value: "__root__",
        label: `${color.bold("Workspace Root")} ${color.dim("(main or dev deps)")}`,
      });

      const selected = await select({
        message: `Where should ${color.cyan(packageName)} be installed?`,
        options: selections,
      });

      if (isCancel(selected)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      if (selected === "__root__") {
        isWorkspaceRoot = true;
      } else {
        target = selected as string;
      }
    }
  }

  // Check if it's an internal workspace package
  const isInternal = await workspaceUtils.isInternalPackage(packageName, rootDir);
  if (isInternal) {
    logger.info(
      `${color.cyan(packageName)} is an internal workspace package. Using workspace protocol.`,
    );
  }

  // Build command
  const args: string[] = ["add"];
  if (options.dev) args.push("-D");

  if (isWorkspaceRoot) {
    args.push("-w");
  } else if (target) {
    args.push("--filter", target);
  }

  args.push(isInternal ? `${packageName}@workspace:*` : packageName);

  // Execute
  try {
    logger.info(
      `Installing ${color.cyan(packageName)}${isWorkspaceRoot ? " to workspace root" : target ? ` to ${color.cyan(target)}` : ""}...`,
    );
    await execa(packageManager, args, {
      stdio: "inherit",
      cwd: rootDir,
    });
    logger.success(`Successfully installed ${color.cyan(packageName)}`);
  } catch (error) {
    logger.error(`Failed to install ${packageName}`);
    process.exit(1);
  }
}

export function registerAddCommand(program: Command) {
  const add = program
    .command(COMMANDS.add)
    .description(DESCRIPTIONS.add)
    .action(async (type, options) => await addComponent(type, options));

  add
    .command(COMMANDS.addApp)
    .argument("[name]", "Name of the application")
    .description(DESCRIPTIONS.addApp)
    .action(async (name) => {
      await addComponent("app", { app: true });
    });

  add
    .command(COMMANDS.addPackage)
    .argument("[name]", "Name of the package")
    .description(DESCRIPTIONS.addPackage)
    .action(async (name) => {
      await addComponent("package", { package: true });
    });

  add
    .command(COMMANDS.addDep)
    .alias(COMMANDS.addDepAlias)
    .argument("<package>", "Package name to install")
    .description(DESCRIPTIONS.addDep)
    .option(ADD_DEP_FLAGS.dev.flag, ADD_DEP_FLAGS.dev.description)
    .option(ADD_DEP_FLAGS.app.flag, ADD_DEP_FLAGS.app.description)
    .option(ADD_DEP_FLAGS.pkg.flag, ADD_DEP_FLAGS.pkg.description)
    .option(ADD_DEP_FLAGS.root.flag, ADD_DEP_FLAGS.root.description)
    .action(async (packageName, options) => {
      await addDependency(packageName, options);
    });
}
