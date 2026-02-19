import type { Command } from "commander";
import { execa } from "execa";
import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";

export function registerRemoteCacheCommands(program: Command) {
  program
    .command(COMMANDS.login)
    .description(DESCRIPTIONS.login)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "login"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to login to Turborepo Remote Cache");
      }
    });

  program
    .command(COMMANDS.logout)
    .description(DESCRIPTIONS.logout)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "logout"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to logout from Turborepo Remote Cache");
      }
    });

  program
    .command(COMMANDS.link)
    .description(DESCRIPTIONS.link)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "link"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to link project to Turborepo Remote Cache");
      }
    });

  program
    .command(COMMANDS.unlink)
    .description(DESCRIPTIONS.unlink)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "unlink"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to unlink project from Turborepo Remote Cache");
      }
    });
}
