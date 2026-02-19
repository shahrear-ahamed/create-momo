import type { Command } from "commander";
import { execa } from "execa";
import color from "picocolors";
import { COMMANDS, DESCRIPTIONS, GLOBAL_FLAGS } from "@/constants/commands.js";
import type { TurboOptions } from "@/types/index.js";
import { logger } from "@/utils/logger.js";

async function runTurbo(
  command: string,
  options: TurboOptions = {},
  additionalArgs: string[] = [],
) {
  const args: string[] = [command];

  // Add --filter if provided
  if (options.filter) {
    args.push(GLOBAL_FLAGS.filter.long, options.filter);
  }

  // Add any additional arguments passed through
  args.push(...additionalArgs);

  const fullCommand = `turbo ${args.join(" ")}`;
  logger.info(`Running ${color.cyan(fullCommand)}...`);

  try {
    // Attempt to run via npx to ensure turbo is available even if not in PATH/global
    await execa("npx", ["turbo", ...args], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    // If it's a known error from turbo (like the one user got), it will already have been printed via stdio: inherit
    // We just need to exit gracefully but indicate failure.
    logger.error(`\n${color.bold("Error:")} Failed to execute ${color.cyan(`momo ${command}`)}`);
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
      logger.error(`Failed to clean workspace: ${(error as Error).message}`);
    }
  },
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

  program
    .command(COMMANDS.test)
    .description(DESCRIPTIONS.test)
    .option(GLOBAL_FLAGS.filter.flag, GLOBAL_FLAGS.filter.description)
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.test(options, unknownArgs);
    });

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
