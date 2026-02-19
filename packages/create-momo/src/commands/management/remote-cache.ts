import type { Command } from "commander";
import { execa } from "execa";
import color from "picocolors";
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
        const err = error as Error;
        logger.error(`${color.bold("Login Failed:")} Could not authenticate with Turborepo.`);
        logger.error(`${color.red("Details:")} ${err.message.split("\n")[0]}`);
      }
    });

  program
    .command(COMMANDS.logout)
    .description(DESCRIPTIONS.logout)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "logout"], { stdio: "inherit" });
      } catch (error) {
        const err = error as Error;
        logger.error(`${color.bold("Logout Failed:")} Could not revoke Turborepo authentication.`);
        logger.error(`${color.red("Details:")} ${err.message.split("\n")[0]}`);
      }
    });

  program
    .command(COMMANDS.link)
    .description(DESCRIPTIONS.link)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "link"], { stdio: "inherit" });
      } catch (error) {
        const err = error as Error;
        logger.error(`${color.bold("Link Failed:")} Could not link project to Vercel team.`);
        logger.error(`${color.red("Details:")} ${err.message.split("\n")[0]}`);
      }
    });

  program
    .command(COMMANDS.unlink)
    .description(DESCRIPTIONS.unlink)
    .action(async () => {
      try {
        await execa("npx", ["turbo", "unlink"], { stdio: "inherit" });
      } catch (error) {
        const err = error as Error;
        logger.error(
          `${color.bold("Unlink Failed:")} Could not unlink project from remote caching.`,
        );
        logger.error(`${color.red("Details:")} ${err.message.split("\n")[0]}`);
      }
    });
}
