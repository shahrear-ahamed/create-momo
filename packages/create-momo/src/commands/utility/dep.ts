import { isCancel, select } from "@clack/prompts";
import type { Command } from "commander";
import { execa } from "execa";
import color from "picocolors";
import { configManager } from "@/commands/config/config.js";
import { logger } from "@/utils/logger.js";
import { workspaceUtils } from "@/utils/workspace.js";

interface AddDepOptions {
  dev?: boolean;
  app?: string;
  pkg?: string;
  root?: boolean;
}

async function addDependency(packageName: string, options: AddDepOptions) {
  const config = await configManager.load();
  const packageManager = config.manager || "pnpm";

  // Guard: Must be inside a momo project
  const rootDir = process.cwd();
  const configPath = `${rootDir}/momo.config.json`;
  if (!require("fs-extra").existsSync(configPath)) {
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
        label: `${color.bold("Workspace Root")} ${color.dim("(shared dev dependencies)")}`,
      });

      const selected = await select({
        message: `Where should ${color.cyan(packageName)} be installed?`,
        options: selections,
      });

      if (isCancel(selected)) {
        logger.warn("Operation cancelled.");
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

export function registerDepCommand(program: Command) {
  program
    .command("dep")
    .alias("get")
    .description("Add a dependency to a workspace package or app")
    .argument("<package>", "Package name to install")
    .option("-D, --dev", "Install as devDependency")
    .option("-a, --app <name>", "Target a specific app")
    .option("-p, --pkg <name>", "Target a specific package")
    .option("-w, --root", "Install to workspace root")
    .action(async (packageName, options) => {
      await addDependency(packageName, options);
    });
}
