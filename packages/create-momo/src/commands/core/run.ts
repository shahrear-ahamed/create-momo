import { configManager } from "@/commands/config/config.js";
import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";
import type { Command } from "commander";
import { execa } from "execa";
import color from "picocolors";

export async function runTask(task: string, options: { filter?: string } = {}) {
  const config = await configManager.load();
  const manager = config.manager || "pnpm";

  const args = ["run", task];
  if (options.filter) {
    args.push("--filter", options.filter);
  }

  try {
    logger.info(`Running ${color.cyan(task)} via ${color.bold("Turborepo")}...`);
    await execa(manager, args, { stdio: "inherit" });
  } catch {
    // Turbo handles its own error output generally
  }
}

export function registerRunCommand(program: Command) {
  program
    .command(COMMANDS.run)
    .argument("<task>", "The task to execute (e.g., build, dev, test)")
    .description(DESCRIPTIONS.run)
    .option("-f, --filter <package>", "Filter to specific package(s)")
    .action(async (task, options) => {
      await runTask(task, options);
    });

  // Register shorthands for common tasks
  const tasks = ["build", "dev", "lint", "test", "start"];
  tasks.forEach((task) => {
    program
      .command(task)
      .description(`Shorthand for 'momo run ${task}'`)
      .option("-f, --filter <package>", "Filter to specific package(s)")
      .action(async (options) => {
        await runTask(task, options);
      });
  });
}
