import type { Command } from "commander";
import { execa } from "execa";
import { logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";

export function registerTurboUtils(program: Command) {
  program
    .command("clean")
    .description("Remove node_modules, dist, and .turbo cache across the workspace")
    .action(async () => {
      const root = projectUtils.findProjectRoot();
      if (!root) {
        logger.error("Must be inside a Momo project for this command");
        return;
      }

      try {
        logger.info("Cleaning workspace...");
        // This is a naive implementation, ideally we should use a more robust way to find and delete these
        // But for now, we can use a simple execa call to rm -rf
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
    });

  program
    .command("test")
    .description("Run tests across the workspace using Turborepo")
    .option("-f, --filter <filter>", "Filter workspaces to test")
    .action(async (options) => {
      const args = ["turbo", "test"];
      if (options.filter) {
        args.push(`--filter=${options.filter}`);
      }

      try {
        await execa("npx", args, { stdio: "inherit" });
      } catch (error) {
        logger.error("Tests failed");
      }
    });
}
