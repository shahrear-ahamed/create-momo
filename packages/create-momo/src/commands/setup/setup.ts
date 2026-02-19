import type { Command } from "commander";
import color from "picocolors";
import { logger } from "@/utils/logger.js";

export const setupCommand = {
  publish: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} NPM publishing orchestration will be available in a future update.`,
    );
  },

  openSource: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} Open source boilerplate generation (LICENSE, etc.) will be available in a future update.`,
    );
  },

  closeSource: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} Proprietary project configuration will be available in a future update.`,
    );
  },

  project: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} Full project blueprints (SaaS, API, etc.) will be available in a future update.`,
    );
  },
};

export function registerSetupCommands(program: Command) {
  const setup = program
    .command("setup")
    .description("Configure project-wide standards (Coming Soon)")
    .action(async () => {
      logger.info(
        `${color.bold("Coming Soon:")} Project setup and standardization tools will be available in a future update.`,
      );
      logger.info("Try 'momo setup --help' to see upcoming subcommands.");
    });

  setup
    .command("project")
    .description("Select pre-configured blueprint (Coming Soon)")
    .action(async () => await setupCommand.project());

  setup
    .command("publish")
    .description("Configure npm publishing (Coming Soon)")
    .action(async () => await setupCommand.publish());

  setup
    .command("open-source")
    .description("Add open-source files (Coming Soon)")
    .action(async () => await setupCommand.openSource());

  setup
    .command("close-source")
    .description("Configure for proprietary use (Coming Soon)")
    .action(async () => await setupCommand.closeSource());
}
