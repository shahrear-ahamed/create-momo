import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";
import type { Command } from "commander";
import color from "picocolors";

export const deployCommand = {
  init: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} Deployment configuration initialization will be available in a future update.`,
    );
  },

  push: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} Direct deployment to platforms will be available in a future update.`,
    );
  },
};

export function registerDeployCommands(program: Command) {
  const deploy = program
    .command(COMMANDS.deploy)
    .description(DESCRIPTIONS.deploy)
    .action(async () => {
      logger.info(
        `${color.bold("Coming Soon:")} Deployment workflows will be available in a future update.`,
      );
      logger.info("Try 'momo deploy --help' to see upcoming subcommands.");
    });

  deploy
    .command(COMMANDS.deployInit)
    .description(DESCRIPTIONS.deployInit)
    .action(async () => await deployCommand.init());

  deploy
    .command(COMMANDS.deployPush)
    .description(DESCRIPTIONS.deployPush)
    .action(async () => await deployCommand.push());
}
