import { configManager } from "@/commands/config/config.js";
import { COMMANDS, DESCRIPTIONS, GLOBAL_FLAGS } from "@/constants/commands.js";
import type { TurboOptions } from "@/types/index.js";
import { logger } from "@/utils/logger.js";
import type { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import color from "picocolors";

async function runTurbo(
  command: string,
  options: TurboOptions = {},
  additionalArgs: string[] = [],
) {
  const config = await configManager.load();
  const manager = config.manager || "pnpm";
  const rootDir = process.cwd();

  // Check if node_modules exists
  if (!fs.existsSync(path.join(rootDir, "node_modules"))) {
    logger.warn(
      `\n${color.bold("Dependencies Missing:")} ${color.yellow("node_modules")} folder not found.`,
    );
    logger.info(`Please run ${color.cyan("momo install")} first to set up your project.`);
    process.exit(1);
  }

  // Use the package manager to run turbo directly
  // Command mapping: pnpm exec turbo, yarn turbo, bun x turbo, npm exec turbo
  let args: string[] = [];
  if (manager === "pnpm") args = ["exec", "turbo", command];
  else if (manager === "yarn") args = ["turbo", command];
  else if (manager === "bun") args = ["x", "turbo", command];
  else args = ["exec", "turbo", "--", command];

  // Add --filter if provided
  if (options.filter) {
    args.push(GLOBAL_FLAGS.filter.long, options.filter);
  }

  // Add any additional arguments passed through
  args.push(...additionalArgs);

  // Force TUI for dev and start if not explicitly set to something else
  if ((command === "dev" || command === "start") && !args.some((a) => a.startsWith("--ui"))) {
    args.push("--ui", "tui");
  }

  try {
    await execa(manager, args, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `\n${color.bold("Execution Failed:")} ${color.cyan(`momo ${command}`)} encountered an error.`,
    );

    // Provide specific guidance based on error message
    if (err.message.includes("ENOENT")) {
      logger.error(
        `The ${color.yellow(manager)} executable was not found. Please ensure it is installed.`,
      );
    } else {
      logger.error(`${color.red("Details:")} ${err.message.split("\n")[0]}`);
    }

    process.exit(1);
  }
}

export const projectCommand = {
  build: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo(COMMANDS.build, options, additionalArgs),
  dev: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo(COMMANDS.dev, options, additionalArgs),
  lint: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo(COMMANDS.lint, options, additionalArgs),
  start: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo(COMMANDS.start, options, additionalArgs),
  test: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo(COMMANDS.test, options, additionalArgs),
  graph: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo(COMMANDS.graph, options, additionalArgs),
  clean: async () => {
    const { projectUtils } = await import("@/utils/project.js");
    const root = projectUtils.findProjectRoot();
    if (!root) {
      logger.error("Must be inside a Momo project for this command");
      return;
    }

    try {
      logger.info("Cleaning workspace...");
      await execa(
        "find",
        [".", "-name", "node_modules", "-type", "d", "-prune", "-exec", "rm", "-rf", "{}", "+"],
        { cwd: root },
      );
      await execa(
        "find",
        [".", "-name", "dist", "-type", "d", "-prune", "-exec", "rm", "-rf", "{}", "+"],
        { cwd: root },
      );
      await execa(
        "find",
        [".", "-name", ".turbo", "-type", "d", "-prune", "-exec", "rm", "-rf", "{}", "+"],
        { cwd: root },
      );
      logger.success("Workspace cleaned successfully!");
    } catch (error) {
      const err = error as Error;
      logger.error(`${color.bold("Cleanup Failed:")} Could not remove all build artifacts.`);
      logger.error(`${color.red("Reason:")} ${err.message.split("\n")[0]}`);

      if (err.message.includes("permission denied")) {
        logger.info(
          `${color.yellow("Tip:")} Try running with elevated permissions or check file locks.`,
        );
      }
    }
  },
};

export function registerProjectCommands(program: Command) {
  program
    .command(COMMANDS.graph)
    .description(DESCRIPTIONS.graph)
    .option(GLOBAL_FLAGS.filter.flag, GLOBAL_FLAGS.filter.description)
    .action(async (options) => {
      await projectCommand.graph(options);
    });

  program
    .command(COMMANDS.clean)
    .description(DESCRIPTIONS.clean)
    .action(async () => {
      await projectCommand.clean();
    });
}
