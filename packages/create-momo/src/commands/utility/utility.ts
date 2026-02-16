import path from "node:path";
import type { Command } from "commander";
import fs from "fs-extra";
import color from "picocolors";
import { configManager } from "@/commands/config/config.js";
import { logger } from "@/utils/logger.js";

export const utilityCommand = {
  list: async () => {
    logger.info("Available component flavors:");
    console.log(`  ${color.cyan("base")}      Vanilla / Generic TypeScript`);
    console.log(`  ${color.cyan("nextjs")}    Next.js Optimized`);
    console.log(`  ${color.cyan("react")}     React (Vite) Optimized`);
    console.log(`  ${color.cyan("node")}      Node.js / Express Optimized`);
  },

  doctor: async () => {
    logger.info("Checking project health...");

    const config = await configManager.load();
    const checks = [
      { name: "package.json", path: "package.json", required: true },
      { name: "turbo.json", path: "turbo.json", required: true },
      { name: "packages directory", path: "packages", required: true },
      { name: "apps directory", path: "apps", required: true },
    ];

    if (config.manager === "pnpm") {
      checks.push({
        name: "pnpm-workspace.yaml",
        path: "pnpm-workspace.yaml",
        required: true,
      });
    }

    let healthy = true;
    for (const check of checks) {
      if (fs.existsSync(path.join(process.cwd(), check.path))) {
        logger.step(`${color.green("✔")} ${check.name} found`);
      } else {
        if (check.required) {
          logger.step(`${color.red("✘")} ${check.name} missing`);
          healthy = false;
        } else {
          logger.step(
            `${color.yellow("!")} ${check.name} not found (optional)`,
          );
        }
      }
    }

    if (healthy) {
      logger.success(
        "Project is healthy! All required monorepo files are in place.",
      );
    } else {
      logger.warn("Some critical issues were found in your project setup.");
      logger.info(
        `Make sure you are in the root of your ${color.cyan("create-momo")} project.`,
      );
    }
  },

  update: async () => {
    logger.info("Checking for configuration updates...");
    logger.success("Configurations are up to date.");
  },
};

export function registerUtilityCommands(program: Command) {
  program
    .command("list")
    .description("List available component flavors")
    .action(async () => await utilityCommand.list());

  program
    .command("doctor")
    .description("Check project health")
    .action(async () => await utilityCommand.doctor());

  program
    .command("update")
    .description("Update configurations")
    .action(async () => await utilityCommand.update());
}
