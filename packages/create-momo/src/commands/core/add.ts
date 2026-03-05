import { configManager } from "@/commands/config/config.js";
import { ADD_ACTION_FLAGS, COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { AddComponentSchema } from "@/schemas/commands.schema.js";
import type { AddDepOptions, AddOptions } from "@/types/index.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { templateEngine } from "@/utils/template-engine.js";
import { validators } from "@/utils/validators.js";
import { workspaceUtils } from "@/utils/workspace.js";
import { cancel, confirm, isCancel, select, text } from "@clack/prompts";
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
  else if (options.config) componentType = "config";

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
          value: "stack",
          label: "modular stack / integration",
          hint: "Convex, Drizzle, etc.",
        },
        {
          value: "shadcn",
          label: "shadcn ui",
          hint: "add components or initialize",
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

  let options: { value: string; label: string; hint?: string }[] = [];

  if (componentType === "app") {
    options = [
      { value: "blank", label: "blank (minimal package.json)" },
      { value: "with-nextjs", label: "next.js" },
      { value: "with-react-vite", label: "react (vite)" },
      { value: "with-node-express", label: "node.js / express" },
      { value: "with-expo", label: "expo / react native" },
      { value: "with-tanstack-start", label: "tanstack start" },
      { value: "external", label: "Fresh / External Framework (pnpm create)" },
    ];
  } else if (componentType === "package") {
    options = [
      { value: "blank", label: "blank (minimal package.json)" },
      { value: "with-ui-shared", label: "shared ui library" },
    ];
  } else if (componentType === "config") {
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

export async function initShadcn() {
  const rootDir = process.cwd();
  const uiDir = path.join(rootDir, "packages/ui");

  logger.info(`\n${color.blue("Shadcn UI Initialization:")} Setting up workspace... 🎨`);

  if (!fs.existsSync(uiDir)) {
    logger.info(`Creating ${color.cyan("packages/ui")} for shared components...`);
    await addComponent("package", { package: "ui" }, "ui");
  }

  try {
    logger.step("Initializing Shadcn in shared UI package...");
    await execa("npx", ["shadcn@latest", "init", "-y", "--cwd", uiDir], { stdio: "inherit" });

    logger.success("Shadcn UI initialized successfully! 🛡️⚡️");
    logger.info(`Next steps:`);
    logger.step(`  momo add shadcn:button        (Adds to shared UI)`);
    logger.step(`  momo add shadcn:card --to web  (Adds to specific app)`);
  } catch (error) {
    logger.error(`Failed to initialize Shadcn: ${(error as Error).message}`);
    process.exit(1);
  }
}

export async function handleShadcnAdd(component: string, options: any) {
  const rootDir = process.cwd();
  const targetApp = options.toApp || options.app;
  const targetPkg = options.toPkg || options.pkg || "ui";

  let targetDir = path.join(rootDir, "packages", targetPkg);

  if (targetApp && typeof targetApp === "string") {
    targetDir = path.join(rootDir, "apps", targetApp);
  }

  if (!fs.existsSync(targetDir)) {
    logger.error(
      `${color.red("Target Not Found:")} Directory ${color.cyan(targetDir)} does not exist.`,
    );
    process.exit(1);
  }

  try {
    const spinner = createSpinner(
      `Adding shadcn ${color.cyan(component)} to ${color.bold(path.basename(targetDir))}...`,
    );

    if (!fs.existsSync(path.join(targetDir, "components.json"))) {
      spinner.stop(`${color.yellow("Missing components.json")}`);
      const shouldInit = await confirm({
        message: `Shadcn is not initialized in ${path.basename(targetDir)}. Initialize now?`,
        initialValue: true,
      });

      if (shouldInit && !isCancel(shouldInit)) {
        await execa("npx", ["shadcn@latest", "init", "-y", "--cwd", targetDir], {
          stdio: "inherit",
        });
      } else {
        cancel("Operation cancelled.");
        process.exit(0);
      }
    }

    await execa("npx", ["shadcn@latest", "add", component, "--cwd", targetDir, "-y"], {
      stdio: "inherit",
    });

    logger.success(`Successfully added ${color.bold(component)}! 🛡️⚡️`);
  } catch (error) {
    logger.error(`Failed to add shadcn component: ${(error as Error).message}`);
    process.exit(1);
  }
}

// ─── Main Logic ─────────────────────────────────────────────────────────────

export async function addComponent(typeOrName?: string, options: AddOptions = {}, name?: string) {
  let resolvedType = typeOrName;
  let resolvedName = name;

  const validTypes: string[] = ["app", "package", "config", "shadcn", "stack"];

  if (typeOrName && !validTypes.includes(typeOrName)) {
    resolvedName = typeOrName;
    resolvedType = undefined;
  }

  if (typeof options.app === "string") resolvedName = options.app;
  else if (typeof options.package === "string") resolvedName = options.package;
  else if (typeof options.config === "string") resolvedName = options.config;
  else if (options.name) resolvedName = options.name;

  // Handle shadcn: prefix or direct shadcn commands
  if (resolvedName?.startsWith("shadcn:")) {
    const action = resolvedName.split(":")[1];
    if (action === "init") {
      return initShadcn();
    }
    return handleShadcnAdd(action, options);
  }

  const validated = AddComponentSchema.parse({ type: resolvedType, options });
  let componentType = await getComponentType(validated.type, validated.options);

  if (componentType === "shadcn") {
    const action = await select({
      message: "What shadcn action would you like to perform?",
      options: [
        { value: "add", label: "add component", hint: "button, card, etc." },
        { value: "init", label: "initialize", hint: "setup shadcn in workspace" },
      ],
    });

    if (isCancel(action)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    if (action === "init") return initShadcn();

    const componentName = await text({
      message: "Which component would you like to add?",
      placeholder: "button",
      validate: (v) => (!v || v.length === 0 ? "Component name is required" : undefined),
    });

    if (isCancel(componentName)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    return handleShadcnAdd(componentName as string, options);
  }

  // Find template roots
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(__dirname, "../templates"), // dist/ -> templates/
    path.resolve(__dirname, "../../../templates"), // src/commands/core -> templates/
  ];
  const templateBase = candidates.find((p) => fs.existsSync(p)) || candidates[0];
  const componentTemplateRoot = path.join(templateBase, "components");
  const stackTemplateRoot = path.join(templateBase, "stacks");

  // Inferred Routing (Smart Routing)
  if (!componentType && resolvedName) {
    const searchNames = [resolvedName, `with-${resolvedName}`, `config-${resolvedName}`];
    for (const sName of searchNames) {
      const templateDir = path.join(componentTemplateRoot, sName);
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
        } catch {
          // Ignore errors for individual packages
        }
      }
    }
  }

  // Generic Framework Fallback (Guided)
  if (resolvedName && !componentType) {
    const isFlavorAvailable = fs.existsSync(path.join(componentTemplateRoot, resolvedName));
    const isWithFlavorAvailable = fs.existsSync(
      path.join(componentTemplateRoot, `with-${resolvedName}`),
    );

    if (!isFlavorAvailable && !isWithFlavorAvailable) {
      // Ask user for confirmation before jumping to external initializer
      const shouldExternal = await confirm({
        message: `I couldn't find a local template for "${color.bold(resolvedName)}". Would you like to use it as an external framework initializer (powered by ${color.cyan("pnpm create")})?`,
        initialValue: true,
      });

      if (isCancel(shouldExternal) || !shouldExternal) {
        logger.info(`${color.dim("ℹ")} Okay, let's try selecting a component type manually.`);
      } else {
        return handleExternalFramework(resolvedName, options);
      }
    }
  }

  const componentName = await getComponentName(componentType, resolvedName);
  const targetRoot =
    componentType === "app" ? "apps" : componentType === "stack" ? "stacks" : "packages";

  // Handle stack specifically
  if (componentType === "stack") {
    const categories = await fs.readdir(stackTemplateRoot);
    const stackChoices: { value: string; label: string; hint?: string }[] = [];

    for (const cat of categories) {
      const catPath = path.join(stackTemplateRoot, cat);
      if (fs.statSync(catPath).isDirectory()) {
        const items = await fs.readdir(catPath);
        for (const item of items) {
          const itemPath = path.join(catPath, item);
          const momoPath = path.join(itemPath, "momo.json");
          if (fs.existsSync(momoPath)) {
            const mConfig = fs.readJsonSync(momoPath);
            stackChoices.push({
              value: `${cat}/${item}`,
              label: mConfig.name || item,
              hint: mConfig.description,
            });
          }
        }
      }
    }

    const selectedStack = await select({
      message: "Which stack would you like to add?",
      options: stackChoices,
    });

    if (isCancel(selectedStack)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    const [cat, item] = (selectedStack as string).split("/");
    const templateDir = path.join(stackTemplateRoot, cat, item);
    const mConfig = fs.readJsonSync(path.join(templateDir, "momo.json"));

    const targetDir = path.join(process.cwd(), mConfig.target.replace("{{name}}", componentName));

    const spinner = createSpinner(`Adding stack ${color.cyan(item)}...`);
    try {
      const config = await configManager.load();
      const scope = config.packageScope || config.scope || "@momo";

      await templateEngine.copyTemplate(templateDir, targetDir, {
        name: componentName,
        scope,
        projectName: path.basename(process.cwd()),
      });

      spinner.stop(`Stack ${color.bold(item)} added successfully!`);
      logger.success(`\nIntegranted into ${color.underline(targetDir)}`);
      return;
    } catch (error) {
      spinner.stop(`${color.red("Failed:")} ${(error as Error).message}`);
      process.exit(1);
    }
  }

  const finalName = componentType === "config" ? `config-${componentName}` : componentName;
  const targetDir = path.join(process.cwd(), targetRoot, finalName);

  let flavor =
    resolvedName && fs.existsSync(path.join(componentTemplateRoot, resolvedName))
      ? resolvedName
      : componentType === "config"
        ? `config-${componentName}`
        : await getComponentFlavor(componentType, options.flavor);

  if (flavor === "external") {
    const framework = await text({
      message: "which framework do you want to use? (e.g. svelte, nest, nuxt)",
      placeholder: "svelte",
      validate: (val) => (val && val.length > 0 ? undefined : "Framework name is required"),
    });

    if (isCancel(framework)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    return handleExternalFramework(framework as string, options);
  }

  // Map 'blank' to the single blank template
  if (flavor === "blank") {
    flavor = "blank";
  }

  const templateDir = path.join(componentTemplateRoot, flavor);
  const spinner = createSpinner(`Creating ${componentType}...`);

  try {
    const config = await configManager.load();
    const scope = config.packageScope || config.scope || "@momo";

    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template for flavor "${flavor}" not found at ${templateDir}`);
    }

    await templateEngine.copyTemplate(templateDir, targetDir, {
      name: componentName,
      scope,
    });

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

  // If no package name, perform a bare install
  if (!packageName) {
    try {
      logger.info(`Installing project dependencies via ${color.bold(packageManager)}...`);
      await execa(packageManager, ["install"], { stdio: "inherit", cwd: rootDir });
      logger.success("Dependencies installed successfully!");
      return;
    } catch {
      logger.error(`\n${color.bold("Installation Failed:")} Could not install dependencies.`);
      process.exit(1);
    }
  }

  const resolvedName = packageName;
  const { target, isWorkspaceRoot } = await getInstallationTarget(resolvedName, options);
  const isInternal = await workspaceUtils.isInternalPackage(resolvedName, rootDir);

  const args: string[] = ["add"];
  if (options.dev) args.push("-D");
  if (isWorkspaceRoot) args.push("-w");
  else if (target) args.push("--filter", target);
  args.push(isInternal ? `${resolvedName}@workspace:*` : resolvedName);

  try {
    logger.info(`Installing ${color.cyan(resolvedName)}...`);
    await execa(packageManager, args, { stdio: "inherit", cwd: rootDir });
    logger.success(`Successfully installed ${color.cyan(resolvedName)}`);
  } catch {
    logger.error(
      `\n${color.bold("Installation Failed:")} Could not install ${color.cyan(resolvedName)}.`,
    );
    process.exit(1);
  }
}

// ─── Command Registration ────────────────────────────────────────────────────

export function registerAddCommand(program: Command) {
  const add = program
    .command(COMMANDS.add)
    .argument("[type]", "Type or name of component to add (e.g. app, shadcn:button)")
    .description(DESCRIPTIONS.add)
    .option(ADD_ACTION_FLAGS.app.flag, ADD_ACTION_FLAGS.app.description)
    .option(ADD_ACTION_FLAGS.package.flag, ADD_ACTION_FLAGS.package.description)
    .option(ADD_ACTION_FLAGS.config.flag, ADD_ACTION_FLAGS.config.description)
    .option(ADD_ACTION_FLAGS.name.flag, ADD_ACTION_FLAGS.name.description)
    .option(ADD_ACTION_FLAGS.to.flag, ADD_ACTION_FLAGS.to.description)
    .option(ADD_ACTION_FLAGS.yes.flag, ADD_ACTION_FLAGS.yes.description)
    .option("-l, --flavor <flavor>", "Select component flavor (blank, nextjs, react, node)")
    .action(async (type, options) => {
      await addComponent(type, options);
    });

  // Legacy subcommands preserved for CLI consistency
  add
    .command(COMMANDS.addConfig)
    .argument("[name]")
    .description(DESCRIPTIONS.addConfig)
    .action((name, options) => addComponent("config", { ...options, config: true }, name));
  add
    .command(COMMANDS.addApp)
    .argument("[name]")
    .description(DESCRIPTIONS.addApp)
    .option("-l, --flavor <flavor>", "Select component flavor")
    .action((name, options) => addComponent("app", { ...options, app: true }, name));
  add
    .command(COMMANDS.addPackage)
    .argument("[name]")
    .description(DESCRIPTIONS.addPackage)
    .option("-l, --flavor <flavor>", "Select component flavor")
    .action((name, options) => addComponent("package", { ...options, package: true }, name));
}
