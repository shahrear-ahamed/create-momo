import { addDependency } from "@/commands/core/add.js";
import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";
import type { Command } from "commander";
import color from "picocolors";

export function registerInstallCommand(program: Command) {
  program
    .command(COMMANDS.install)
    .argument("[package]", "Package name to install from NPM")
    .description(DESCRIPTIONS.install)
    .option("-D, --dev", "Install as devDependency")
    .option("-a, --app <name>", "Target a specific app")
    .option("-p, --pkg <name>", "Target a specific package")
    .option("-w, --root", "Install to workspace root")
    .action(async (packageName, options) => {
      if (packageName?.startsWith("shadcn:")) {
        logger.info(
          `${color.yellow("Note:")} For structural components like Shadcn, use ${color.cyan("momo add")}.`,
        );
        logger.info(`Redirecting: ${color.dim(`momo add ${packageName}`)}`);
        const { addComponent } = await import("@/commands/core/add.js");
        return addComponent(packageName, options);
      }

      const addOptions = {
        dev: options.dev,
        toApp: options.app,
        toPkg: options.pkg,
        root: options.root,
      };
      await addDependency(packageName, addOptions);
    });
}
