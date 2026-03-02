import { fileOps } from "@/utils/file-ops.js";
import { logger } from "@/utils/logger.js";
import { confirm, select } from "@clack/prompts";
import type { Command } from "commander";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import color from "picocolors";

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

  ci: async () => {
    const provider = await select({
      message: "select your CI provider",
      options: [{ value: "github", label: "github actions" }],
    });

    if (!provider || typeof provider !== "string") return;

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const templatePath = path.resolve(__dirname, `../../templates/setup/ci/${provider}/ci.yml`);
    const targetPath = path.join(process.cwd(), ".github/workflows/ci.yml");

    if (fs.existsSync(targetPath)) {
      const overwrite = await confirm({
        message: "ci.yml already exists. overwrite?",
        initialValue: false,
      });
      if (!overwrite) return;
    }

    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(templatePath, targetPath);
    logger.success(`Successfully generated CI workflow in ${color.underline(targetPath)}`);
  },

  env: async () => {
    const rootDir = process.cwd();
    const envExamples = await fileOps.findFiles("**/ .env.example", rootDir);

    if (envExamples.length === 0) {
      logger.info("no .env.example files found in the workspace.");
      return;
    }

    logger.info(`found ${envExamples.length} environment example files.`);
    for (const example of envExamples) {
      const targetEnv = example.replace(".env.example", ".env");
      if (!fs.existsSync(targetEnv)) {
        const create = await confirm({
          message: `create ${color.cyan(path.relative(rootDir, targetEnv))} from example?`,
          initialValue: true,
        });
        if (create) {
          await fs.copy(example, targetEnv);
          logger.step(`created ${color.green(path.relative(rootDir, targetEnv))}`);
        }
      }
    }
    logger.success("Environment sync complete.");
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

  setup
    .command("ci")
    .description("Configure continuous integration workflows")
    .action(async () => await setupCommand.ci());

  setup
    .command("env")
    .description("Manage environment variables")
    .action(async () => await setupCommand.env());
}
