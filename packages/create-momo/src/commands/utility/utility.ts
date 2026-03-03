import { configManager } from "@/commands/config/config.js";
import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { createSpinner, logger } from "@/utils/logger.js";
import type { Command } from "commander";
import fs from "fs-extra";
import path from "node:path";
import color from "picocolors";

export const utilityCommand = {
  list: async (options: { remote?: boolean } = {}) => {
    if (options.remote) {
      const spinner = createSpinner("Fetching remote templates...");
      try {
        const { execa } = await import("execa");
        const repoUrl =
          "https://api.github.com/repos/shahrear-ahamed/create-momo/contents/templates/components";
        const { stdout } = await execa("curl", ["-s", repoUrl]);
        const files = JSON.parse(stdout) as { name: string; type: string }[];

        spinner.stop("Remote templates fetched successfully!");
        logger.info("Available remote component templates:");
        files
          .filter((f) => f.type === "dir")
          .forEach((f) => {
            console.log(`  ${color.cyan(f.name)}`);
          });
      } catch (error) {
        spinner.stop(`${color.red("Failed:")} Could not fetch remote templates.`);
        logger.error(`Error: ${(error as Error).message}`);
      }
      return;
    }

    logger.info("Available component flavors (local):");
    console.log(`  ${color.cyan("base")}              Vanilla / Generic TypeScript`);
    console.log(`  ${color.cyan("with-nextjs")}       Next.js Optimized`);
    console.log(`  ${color.cyan("with-react-vite")}   React (Vite) Optimized`);
    console.log(`  ${color.cyan("with-node-express")} Node.js / Express Optimized`);
    console.log(`  ${color.cyan("with-expo")}         Expo / React Native`);
    console.log(`  ${color.cyan("with-tanstack-start")} TanStack Start`);
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
          logger.step(`${color.yellow("!")} ${check.name} not found (optional)`);
        }
      }
    }

    if (healthy) {
      logger.success("Project is healthy! All required monorepo files are in place.");
    } else {
      logger.warn("Some critical issues were found in your project setup.");
      logger.info(`Make sure you are in the root of your ${color.cyan("create-momo")} project.`);
    }
  },

  update: async () => {
    logger.info(
      `${color.bold("Coming Soon:")} The update command will soon allow you to synchronize your project's configurations and shared packages with the latest Momo blueprints and standards.`,
    );
  },
};

export function registerUtilityCommands(program: Command) {
  program
    .command(COMMANDS.list)
    .description(DESCRIPTIONS.list)
    .option("-r, --remote", "Fetch available templates from remote registry")
    .action(async (options) => await utilityCommand.list(options));

  program
    .command(COMMANDS.doctor)
    .description(DESCRIPTIONS.doctor)
    .action(async () => await utilityCommand.doctor());

  program
    .command(COMMANDS.update)
    .description(DESCRIPTIONS.update)
    .action(async () => await utilityCommand.update());
}
