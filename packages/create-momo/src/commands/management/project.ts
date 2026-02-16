import type { Command } from "commander";
import { execa } from "execa";
import color from "picocolors";
import { COMMANDS, DESCRIPTIONS, GLOBAL_FLAGS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";

interface TurboOptions {
  filter?: string;
  [key: string]: unknown;
}

async function runTurbo(
  command: string,
  options: TurboOptions = {},
  additionalArgs: string[] = [],
) {
  try {
    const args: string[] = [command];

    // Add --filter if provided (support both --filter and -f alias)
    if (options.filter) {
      args.push(GLOBAL_FLAGS.filter.long, options.filter);
    }

    // Add any additional arguments passed through
    args.push(...additionalArgs);

    logger.info(`Running ${color.cyan(`turbo ${args.join(" ")}`)}...`);

    await execa("turbo", args, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (_error) {
    logger.error(`Failed to run ${command}`);
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
};

export function registerProjectCommands(program: Command) {
  program
    .command(COMMANDS.build)
    .description(DESCRIPTIONS.build)
    .option(GLOBAL_FLAGS.filter.flag, GLOBAL_FLAGS.filter.description)
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.build(options, unknownArgs);
    });

  program
    .command(COMMANDS.dev)
    .description(DESCRIPTIONS.dev)
    .option(GLOBAL_FLAGS.filter.flag, GLOBAL_FLAGS.filter.description)
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.dev(options, unknownArgs);
    });

  program
    .command(COMMANDS.lint)
    .description(DESCRIPTIONS.lint)
    .option(GLOBAL_FLAGS.filter.flag, GLOBAL_FLAGS.filter.description)
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.lint(options, unknownArgs);
    });

  program
    .command(COMMANDS.start)
    .description(DESCRIPTIONS.start)
    .option(GLOBAL_FLAGS.filter.flag, GLOBAL_FLAGS.filter.description)
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.start(options, unknownArgs);
    });
}
