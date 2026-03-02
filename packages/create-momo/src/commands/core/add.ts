import { configManager } from "@/commands/config/config.js";
import { ADD_ACTION_FLAGS, ADD_DEP_FLAGS, COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { AddComponentSchema } from "@/schemas/commands.schema.js";
import type { AddDepOptions, AddOptions } from "@/types/index.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { templateEngine } from "@/utils/template-engine.js";
import { validators } from "@/utils/validators.js";
import { workspaceUtils } from "@/utils/workspace.js";
import { cancel, isCancel, select, text } from "@clack/prompts";
import type { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import color from "picocolors";

interface MomoTemplateConfig {
  type?: "app" | "package" | "config";
  name?: string;
  flavor?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getComponentType(type?: string, options: AddOptions = {}): Promise<string> {
  let componentType = type;

  if (options.app) componentType = "app";
  else if (options.package) componentType = "package";
  else if (options.dep) componentType = "dep";

  if (!componentType) {
    const selected = await select({
      message: "what do you want to add?",
      options: [
        {
          value: "app",
          label: "application (in /apps)",
          hint: "Next.js, Vite, etc.",
        },
        {
          value: "package",
          label: "package (in /packages)",
          hint: "Shared UI, utils, etc.",
        },
        {
          value: "config",
          label: "shared configuration",
          hint: "ESLint, Tailwind, etc.",
        },
        {
          value: "dep",
          label: "dependency",
          hint: "Install a package (main or dev)",
        },
      ],
    });

    if (isCancel(selected)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    componentType = selected as string;
  }

  return componentType as string;
}

async function getComponentName(componentType: string, initialName?: string): Promise<string> {
  if (initialName) return initialName;

  const name = await text({
    message: `what is the name of your new ${componentType}?`,
    placeholder: componentType === "app" ? "web" : componentType === "config" ? "tailwind" : "ui",
    validate: (val) => validators.projectName(val),
  });

  if (isCancel(name)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return name as string;
}

async function getComponentFlavor(componentType: string, initialFlavor?: string): Promise<string> {
  if (initialFlavor) return initialFlavor;

  const options = [
    { value: "base", label: "vanilla / base" },
    { value: "with-nextjs", label: "next.js" },
    { value: "with-react-vite", label: "react (vite)" },
    { value: "with-node-express", label: "node.js / express" },
  ];

  if (componentType === "config") {
    return "config-" + (initialFlavor || "base");
  }

  const flavor = await select({
    message: `select the flavor for your ${componentType}`,
    options,
  });

  if (isCancel(flavor)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return flavor as string;
}

export async function handleExternalFramework(framework: string, _options: any) {
  const componentName = await getComponentName("app");
  const targetDir = path.join(process.cwd(), "apps", componentName);

  logger.info(`Launching ${color.bold(framework)} initializer... 🚀`);

  try {
    // Intercept external creation to ensure it lands in apps/
    await execa("pnpm", ["create", framework, componentName], {
      stdio: "inherit",
      cwd: path.join(process.cwd(), "apps"),
    });

    // Post-creation Momo alignment
    const pkgJsonPath = path.join(targetDir, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = await fs.readJson(pkgJsonPath);
      const config = await configManager.load();
      const scope = config.packageScope || config.scope || "@momo";

      pkg.name = `${scope}/${componentName}`;
      await fs.writeJson(pkgJsonPath, pkg, { spaces: 2 });
      logger.info(`${color.dim("ℹ")} Automatically scoped package name to ${color.bold(pkg.name)}`);
    }

    logger.success(
      `Successfully integrated ${color.bold(framework)} into apps/${componentName}! 🛡️⚡️`,
    );
  } catch (error) {
    logger.error(`Failed to initialize ${framework}: ${(error as Error).message}`);
    process.exit(1);
  }
}

export async function handleShadcnAdd(component: string, options: any) {
  const rootDir = process.cwd();
  const uiDir = path.join(rootDir, "packages/ui");

  if (!fs.existsSync(uiDir)) {
    logger.info(`Creating ${color.cyan("packages/ui")} for Shadcn components...`);
    await addComponent("package", { ...options, package: "ui" }, "ui");
  }

  try {
    const spinner = createSpinner(`Adding shadcn ${color.cyan(component)}...`);
    await execa("npx", ["shadcn@latest", "add", component, "--cwd", uiDir, "-y"], {
      stdio: "inherit",
    });
    spinner.stop(`Successfully added ${color.bold(component)} to packages/ui! 🛡️⚡️`);
    logger.info(
      `${color.dim("Tip:")} Components are available via ${color.cyan(
        "@momo/ui/components/ui/" + component,
      )}`,
    );
  } catch (error) {
    logger.error(`Failed to add shadcn component: ${(error as Error).message}`);
    process.exit(1);
  }
}

// ─── Main Logic ─────────────────────────────────────────────────────────────

export async function addComponent(typeOrName?: string, options: AddOptions = {}, name?: string) {
  let resolvedType = typeOrName;
  let resolvedName = name;

  const validTypes: string[] = ["app", "package", "config", "dep"];

  if (typeOrName && !validTypes.includes(typeOrName)) {
    resolvedName = typeOrName;
    resolvedType = undefined;
  }

  if (typeof options.app === "string") resolvedName = options.app;
  else if (typeof options.package === "string") resolvedName = options.package;
  else if (typeof options.config === "string") resolvedName = options.config;
  else if (typeof options.dep === "string") resolvedName = options.dep;

  // Handle shadcn: prefix
  if (resolvedName?.startsWith("shadcn:")) {
    const shadcnComponent = resolvedName.split(":")[1];
    return handleShadcnAdd(shadcnComponent, options);
  }

  const validated = AddComponentSchema.parse({ type: resolvedType, options });
  let componentType = validated.type;

  // Find template directory early for Smart Routing
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, "../../../templates/components"),
    path.resolve(__dirname, "../../../../../templates/components"),
    path.resolve(__dirname, "../templates/components"),
  ];
  const templateRoot = candidates.find((p) => fs.existsSync(p)) || candidates[0];

  // Inferred Routing (Smart Routing)
  if (!componentType && resolvedName) {
    const searchNames = [resolvedName, `with-${resolvedName}`, `config-${resolvedName}`];
    for (const sName of searchNames) {
      const templateDir = path.join(templateRoot, sName);
      const momoPath = path.join(templateDir, "momo.json");
      if (fs.existsSync(momoPath)) {
        try {
          const mConfig: MomoTemplateConfig = fs.readJsonSync(momoPath);
          if (mConfig.type) {
            componentType = mConfig.type;
            logger.info(
              `${color.dim("ℹ")} Inferred type ${color.bold(
                componentType,
              )} for ${color.cyan(sName)}.`,
            );
            break;
          }
        } catch (_err) {
          /* ignore */
        }
      }
    }
  }

  // Generic Framework Fallback
  if (resolvedName && !componentType) {
    const isFlavorAvailable = fs.existsSync(path.join(templateRoot, resolvedName));
    const isWithFlavorAvailable = fs.existsSync(path.join(templateRoot, `with-${resolvedName}`));

    if (!isFlavorAvailable && !isWithFlavorAvailable) {
      // If name looks like a framework (no internal template), handle as external
      return handleExternalFramework(resolvedName, options);
    }
  }

  componentType = await getComponentType(componentType, validated.options);

  if (componentType === "dep") {
    const packageName =
      resolvedName ||
      (await text({
        message: "what is the name of the package?",
        placeholder: "zod",
      }));
    if (isCancel(packageName)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    return addDependency(packageName as string, options);
  }

  const componentName = await getComponentName(componentType, resolvedName);
  const targetRoot = componentType === "app" ? "apps" : "packages";
  const finalName = componentType === "config" ? `config-${componentName}` : componentName;
  const targetDir = path.join(process.cwd(), targetRoot, finalName);

  const flavor =
    resolvedName && fs.existsSync(path.join(templateRoot, resolvedName))
      ? resolvedName
      : componentType === "config"
        ? `config-${componentName}`
        : await getComponentFlavor(componentType, options.flavor);

  const templateDir = path.join(templateRoot, flavor);
  const spinner = createSpinner(`Creating ${componentType}...`);

  try {
    const config = await configManager.load();
    const scope = config.packageScope || config.scope || "@momo";

    if (flavor === "base") {
      if (!fs.existsSync(templateDir)) {
        await fileOps.ensureDir(targetDir);
        await fileOps.writeJson(path.join(targetDir, "package.json"), {
          name: componentName,
          version: "0.0.0",
          private: true,
          scripts: { build: "echo build", dev: "echo dev" },
        });
        await fileOps.ensureDir(path.join(targetDir, "src"));
      } else {
        await templateEngine.copyTemplate(templateDir, targetDir, {
          name: componentName,
          scope,
        });
      }
    } else {
      if (!fs.existsSync(templateDir))
        throw new Error(`Template for flavor "${flavor}" not found at ${templateDir}`);
      await templateEngine.copyTemplate(templateDir, targetDir, {
        name: componentName,
        scope,
      });
    }

    spinner.stop(
      `${
        componentType === "app"
          ? "Application"
          : componentType === "config"
            ? "Configuration"
            : "Package"
      } added successfully!`,
    );
    logger.success(`\nCreated ${color.bold(finalName)} in ${color.underline(targetDir)}`);
  } catch (error) {
    const err = error as Error;
    spinner.stop(`${color.red("Failed:")} Could not add ${componentType}.`);
    logger.error(`${color.bold("Reason:")} ${err.message}`);
    if (err.message.includes("EEXIST")) {
      logger.info(
        `${color.yellow("Tip:")} A directory with the name ${color.cyan(
          componentName,
        )} already exists.`,
      );
    }
    process.exit(1);
  }
}

// ─── Dependency Management (Legacy logic preserved for momo install) ─────────

async function promptInstallationTarget(
  workspaces: { name: string; type: string }[],
  packageName: string,
) {
  if (workspaces.length === 0) return { target: null, isWorkspaceRoot: true };
  const selections = workspaces.map((ws) => ({
    value: ws.name,
    label: `${ws.name} ${color.dim(`(${ws.type})`)}`,
  }));
  selections.push({
    value: "__root__",
    label: `${color.bold("Workspace Root")} ${color.dim("(main or dev deps)")}`,
  });
  const selected = await select({
    message: `where should ${color.cyan(packageName)} be installed?`,
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

async function getInstallationTarget(packageName: string, options: AddOptions = {}) {
  const rootDir = process.cwd();
  if (options.root) return { target: null, isWorkspaceRoot: true };
  if (options.toApp) {
    const workspace = await workspaceUtils.findWorkspace(options.toApp, rootDir);
    if (!workspace || workspace.type !== "app") {
      logger.error(
        `${color.bold("App Not Found:")} Target application ${color.cyan(
          options.toApp,
        )} does not exist.`,
      );
      process.exit(1);
    }
    return { target: workspace.name, isWorkspaceRoot: false };
  }
  if (options.toPkg) {
    const workspace = await workspaceUtils.findWorkspace(options.toPkg, rootDir);
    if (!workspace || workspace.type !== "package") {
      logger.error(
        `${color.bold("Package Not Found:")} Target package ${color.cyan(
          options.toPkg,
        )} does not exist.`,
      );
      process.exit(1);
    }
    return { target: workspace.name, isWorkspaceRoot: false };
  }
  const workspaces = await workspaceUtils.discoverWorkspaces(rootDir);
  return promptInstallationTarget(workspaces, packageName);
}

export async function addDependency(packageName?: string, options: AddDepOptions = {}) {
  const config = await configManager.load();
  const packageManager = config.manager || "pnpm";
  const rootDir = process.cwd();

  if (!fs.existsSync(path.join(rootDir, "momo.config.json"))) {
    logger.error(
      `${color.bold(
        "Invalid Context:",
      )} You must be inside a Momo project to install dependencies.`,
    );
    process.exit(1);
  }

  const resolvedName =
    packageName ||
    (await text({
      message: "what is the name of the package?",
      placeholder: "zod",
    }));
  if (isCancel(resolvedName) || !resolvedName) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const { target, isWorkspaceRoot } = await getInstallationTarget(resolvedName as string, options);
  const isInternal = await workspaceUtils.isInternalPackage(resolvedName as string, rootDir);

  const args: string[] = ["add"];
  if (options.dev) args.push("-D");
  if (isWorkspaceRoot) args.push("-w");
  else if (target) args.push("--filter", target);
  args.push(isInternal ? `${resolvedName}@workspace:*` : (resolvedName as string));

  try {
    logger.info(`Installing ${color.cyan(resolvedName as string)}...`);
    await execa(packageManager, args, { stdio: "inherit", cwd: rootDir });
    logger.success(`Successfully installed ${color.cyan(resolvedName as string)}`);
  } catch (_error) {
    logger.error(
      `\n${color.bold("Installation Failed:")} Could not install ${color.cyan(
        resolvedName as string,
      )}.`,
    );
    process.exit(1);
  }
}

// ─── Command Registration ────────────────────────────────────────────────────

export function registerAddCommand(program: Command) {
  const add = program
    .command(COMMANDS.add)
    .description(DESCRIPTIONS.add)
    .option(ADD_ACTION_FLAGS.app.flag, ADD_ACTION_FLAGS.app.description)
    .option(ADD_ACTION_FLAGS.package.flag, ADD_ACTION_FLAGS.package.description)
    .option(ADD_ACTION_FLAGS.config.flag, ADD_ACTION_FLAGS.config.description)
    .option(ADD_ACTION_FLAGS.dep.flag, ADD_ACTION_FLAGS.dep.description)
    .option(ADD_DEP_FLAGS.dev.flag, ADD_DEP_FLAGS.dev.description)
    .option(ADD_DEP_FLAGS.root.flag, ADD_DEP_FLAGS.root.description)
    .option("-l, --flavor <flavor>", "Select component flavor (base, nextjs, react, node)")
    .action(async (options, cmd) => {
      const typeOrName = cmd.args[0];
      await addComponent(typeOrName, options);
    });

  // Legacy subcommands preserved for CLI consistency
  add
    .command(COMMANDS.addConfig)
    .argument("[name]")
    .description(DESCRIPTIONS.addConfig)
    .action((name, _opts, cmd) => addComponent("config", { ...cmd.opts(), config: true }, name));
  add
    .command(COMMANDS.addApp)
    .argument("[name]")
    .description(DESCRIPTIONS.addApp)
    .option("-l, --flavor <flavor>", "Select component flavor")
    .action((name, _opts, cmd) => addComponent("app", { ...cmd.opts(), app: true }, name));
  add
    .command(COMMANDS.addPackage)
    .argument("[name]")
    .description(DESCRIPTIONS.addPackage)
    .option("-l, --flavor <flavor>", "Select component flavor")
    .action((name, _opts, cmd) => addComponent("package", { ...cmd.opts(), package: true }, name));
  add
    .command(COMMANDS.addDep)
    .alias(COMMANDS.addDepAlias)
    .argument("[package]")
    .description(DESCRIPTIONS.addDep)
    .option(ADD_DEP_FLAGS.dev.flag, ADD_DEP_FLAGS.dev.description)
    .option(ADD_DEP_FLAGS.app.flag, ADD_DEP_FLAGS.app.description)
    .option(ADD_DEP_FLAGS.pkg.flag, ADD_DEP_FLAGS.pkg.description)
    .option(ADD_DEP_FLAGS.root.flag, ADD_DEP_FLAGS.root.description)
    .action((packageName, _opts, cmd) => addDependency(packageName, cmd.opts()));
}
