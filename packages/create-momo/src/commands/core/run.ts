import { configManager } from "@/commands/config/config.js";
import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";
import type { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import color from "picocolors";

export async function runTask(
  task: string,
  options: { filter?: string } = {},
  extraArgs: string[] = [],
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

  // Use the package manager to run turbo directly to avoid recursion
  // Command mapping: pnpm exec turbo, yarn turbo, bun x turbo, npm exec turbo
  let args: string[] = [];
  if (manager === "pnpm") args = ["exec", "turbo", task];
  else if (manager === "yarn") args = ["turbo", task];
  else if (manager === "bun") args = ["x", "turbo", task];
  else args = ["exec", "turbo", "--", task];

  if (options.filter) {
    args.push("--filter", options.filter);
  }

  // Add any additional arguments passed through
  args.push(...extraArgs);

  try {
    await execa(manager, args, { stdio: "inherit" });
  } catch (error) {
    // Turbo handles its own error output generally
    process.exit(1);
  }
}

export function registerRunCommand(program: Command) {
  program
    .command(COMMANDS.run)
    .argument("<task>", "The task to execute (e.g., build, dev, test)")
    .description(DESCRIPTIONS.run)
    .option("-f, --filter <package>", "Filter to specific package(s)")
    .allowUnknownOption()
    .action(async (task, options, cmd) => {
      // Capture unknown options/args
      const extraArgs = cmd.args.slice(1);
      await runTask(task, options, extraArgs);
    });

  // Register shorthands for common tasks
  const tasks = ["build", "dev", "lint", "test", "start"];
  tasks.forEach((task) => {
    program
      .command(task)
      .description(`Shorthand for 'momo run ${task}'`)
      .option("-f, --filter <package>", "Filter to specific package(s)")
      .allowUnknownOption()
      .action(async (options, cmd) => {
        // Capture unknown options/args
        const extraArgs = cmd.args;
        await runTask(task, options, extraArgs);
      });
  });
}
