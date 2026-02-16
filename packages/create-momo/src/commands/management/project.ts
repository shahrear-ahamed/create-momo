import type { Command } from "commander";
import { execa } from "execa";
import color from "picocolors";
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
      args.push("--filter", options.filter);
    }

    // Add any additional arguments passed through
    args.push(...additionalArgs);

    const argsDisplay = args.length > 1 ? ` ${args.slice(1).join(" ")}` : "";
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
    await runTurbo("build", options, additionalArgs),
  dev: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo("dev", options, additionalArgs),
  lint: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo("lint", options, additionalArgs),
  start: async (options: TurboOptions = {}, additionalArgs: string[] = []) =>
    await runTurbo("start", options, additionalArgs),
};

export function registerProjectCommands(program: Command) {
  program
    .command("build")
    .description("Build all packages in the monorepo")
    .option("-f, --filter <package>", "Filter to specific package(s)")
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.build(options, unknownArgs);
    });

  program
    .command("dev")
    .description("Run development mode for all packages")
    .option("-f, --filter <package>", "Filter to specific package(s)")
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.dev(options, unknownArgs);
    });

  program
    .command("lint")
    .description("Lint all packages in the monorepo")
    .option("-f, --filter <package>", "Filter to specific package(s)")
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.lint(options, unknownArgs);
    });

  program
    .command("start")
    .description("Start the production build for all packages")
    .option("-f, --filter <package>", "Filter to specific package(s)")
    .allowUnknownOption()
    .action(async (options, command) => {
      const unknownArgs = command.args || [];
      await projectCommand.start(options, unknownArgs);
    });
}
