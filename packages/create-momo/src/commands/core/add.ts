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

async function getComponentType(type?: string, options: AddOptions = {}): Promise<string> {
  let componentType = type;

  if (!componentType && !options.app && !options.package) {
    const selected = await select({
      message: "What do you want to add?",
      options: [
        { value: "app", label: "Application (in /apps)", hint: "Next.js, Vite, etc." },
        { value: "package", label: "Package (in /packages)", hint: "Shared UI, utils, etc." },
        { value: "dep", label: "Dependency", hint: "Install a package (main or dev)" },
      ],
    });

    if (isCancel(selected)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    componentType = selected as string;
  } else {
    if (options.app) componentType = "app";
    if (options.package) componentType = "package";
  }

  return componentType as string;
}

async function getComponentName(componentType: string): Promise<string> {
  const name = await text({
    message: `What is the name of your new ${componentType}?`,
    placeholder: componentType === "app" ? "web" : "ui",
    validate: (val) => validators.projectName(val),
  });

  if (isCancel(name)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return name as string;
}

async function getComponentFlavor(componentType: string): Promise<string> {
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

  return flavor as string;
}

async function ensureSharedConfig(flavor: string) {
  const configPkgDir = path.join(process.cwd(), "packages", "config-typescript");
  const flavorFile = path.join(configPkgDir, `${flavor}.json`);

  const configExists = !(await fileOps.isEmpty(configPkgDir));
  if (!configExists) {
    await fileOps.ensureDir(configPkgDir);
    await fileOps.writeJson(path.join(configPkgDir, "package.json"), getConfigPackageJson("@momo"));
    await fileOps.writeJson(path.join(configPkgDir, "base.json"), getBaseConfig());
  }

  if (flavor === "base") return;

  const flavorExists = await (async () => {
    try {
      await fileOps.readJson(flavorFile);
      return true;
    } catch {
      return false;
    }
  })();

  if (!flavorExists) {
    let configContent: Record<string, unknown> | undefined;
    if (flavor === "nextjs") configContent = getNextjsConfig();
    else if (flavor === "react") configContent = getReactConfig();
    else if (flavor === "node") configContent = getNodeConfig();

    if (configContent) {
      await fileOps.writeJson(flavorFile, configContent);
      logger.info(`Added ${color.cyan(`${flavor}.json`)} to shared config.`);
    }
  }
}

export async function addComponent(type?: string, options: AddOptions = {}) {
  const validated = AddComponentSchema.parse({ type, options });
  const componentType = await getComponentType(validated.type, validated.options);

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

  const componentName = await getComponentName(componentType);
  const targetRoot = componentType === "app" ? "apps" : "packages";
  const targetDir = path.join(process.cwd(), targetRoot, componentName);

  const flavor = await getComponentFlavor(componentType);
  const spinner = createSpinner(`Creating ${componentType}...`);

  try {
    await fileOps.ensureDir(targetDir);
    await fileOps.writeJson(path.join(targetDir, "package.json"), {
      name: componentName,
      version: "0.0.0",
      private: true,
      scripts: { build: "echo build", dev: "echo dev" },
    });

    await ensureSharedConfig(flavor);

    const extendPath = `../../packages/config-typescript/${flavor}.json`;
    await fileOps.writeJson(path.join(targetDir, "tsconfig.json"), {
      extends: extendPath,
      compilerOptions: { outDir: "dist", rootDir: "src" },
      include: ["src"],
      exclude: ["node_modules", "dist"],
    });

    await fileOps.ensureDir(path.join(targetDir, "src"));
    spinner.stop(`${componentType === "app" ? "Application" : "Package"} added successfully!`);
    logger.success(`\nCreated ${color.bold(componentName)} in ${color.underline(targetDir)}`);
  } catch (error) {
    spinner.stop("Failed to add component");
    logger.error((error as Error).message);
    process.exit(1);
  }
}

async function promptInstallationTarget(
  workspaces: { name: string; type: string }[],
  packageName: string,
): Promise<{ target: string | null; isWorkspaceRoot: boolean }> {
  if (workspaces.length === 0) {
    return { target: null, isWorkspaceRoot: true };
  }

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

  return selected === "__root__"
    ? { target: null, isWorkspaceRoot: true }
    : { target: selected as string, isWorkspaceRoot: false };
}

async function getInstallationTarget(
  options: AddDepOptions,
  rootDir: string,
  packageName: string,
): Promise<{ target: string | null; isWorkspaceRoot: boolean }> {
  if (options.root) return { target: null, isWorkspaceRoot: true };

  if (options.app) {
    const workspace = await workspaceUtils.findWorkspace(options.app, rootDir);
    if (!workspace || workspace.type !== "app") {
      logger.error(`App ${color.cyan(options.app)} not found.`);
      process.exit(1);
    }
    return { target: workspace.name, isWorkspaceRoot: false };
  }

  if (options.pkg) {
    const workspace = await workspaceUtils.findWorkspace(options.pkg, rootDir);
    if (!workspace || workspace.type !== "package") {
      logger.error(`Package ${color.cyan(options.pkg)} not found.`);
      process.exit(1);
    }
    return { target: workspace.name, isWorkspaceRoot: false };
  }

  const workspaces = await workspaceUtils.discoverWorkspaces(rootDir);
  return promptInstallationTarget(workspaces, packageName);
}

async function addDependency(packageName: string, options: AddDepOptions) {
  const config = await configManager.load();
  const packageManager = config.manager || "pnpm";
  const rootDir = process.cwd();

  if (!fs.existsSync(path.join(rootDir, "momo.config.json"))) {
    logger.error(`Not inside a ${color.cyan("create-momo")} project.`);
    process.exit(1);
  }

  const { target, isWorkspaceRoot } = await getInstallationTarget(options, rootDir, packageName);
  const isInternal = await workspaceUtils.isInternalPackage(packageName, rootDir);

  if (isInternal) {
    logger.info(`${color.cyan(packageName)} is an internal package. Using workspace protocol.`);
  }

  const args: string[] = ["add"];
  if (options.dev) args.push("-D");
  if (isWorkspaceRoot) args.push("-w");
  else if (target) args.push("--filter", target);

  args.push(isInternal ? `${packageName}@workspace:*` : packageName);

  try {
    logger.info(`Installing ${color.cyan(packageName)}...`);
    await execa(packageManager, args, { stdio: "inherit", cwd: rootDir });
    logger.success(`Successfully installed ${color.cyan(packageName)}`);
  } catch (_error) {
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
    .action(async (_name) => {
      await addComponent("app", { app: true });
    });

  add
    .command(COMMANDS.addPackage)
    .argument("[name]", "Name of the package")
    .description(DESCRIPTIONS.addPackage)
    .action(async (_name) => {
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
