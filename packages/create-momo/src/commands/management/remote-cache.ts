import type { Command } from "commander";
import { execa } from "execa";
import { logger } from "@/utils/logger.js";

export function registerRemoteCacheCommands(program: Command) {
  program
    .command("login")
    .description("Authenticate with Turborepo Remote Cache (Vercel)")
    .action(async () => {
      try {
        await execa("npx", ["turbo", "login"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to login to Turborepo Remote Cache");
      }
    });

  program
    .command("logout")
    .description("Revoke Turborepo authentication")
    .action(async () => {
      try {
        await execa("npx", ["turbo", "logout"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to logout from Turborepo Remote Cache");
      }
    });

  program
    .command("link")
    .description("Link the project to a Vercel team/scope for remote caching")
    .action(async () => {
      try {
        await execa("npx", ["turbo", "link"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to link project to Turborepo Remote Cache");
      }
    });

  program
    .command("unlink")
    .description("Unlink the project from remote caching")
    .action(async () => {
      try {
        await execa("npx", ["turbo", "unlink"], { stdio: "inherit" });
      } catch (error) {
        logger.error("Failed to unlink project from Turborepo Remote Cache");
      }
    });
}
