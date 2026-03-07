import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
import { logger } from "@/utils/logger.js";
import { confirm, select } from "@clack/prompts";
import type { Command } from "commander";
import fs from "fs-extra";
import path from "node:path";
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

  ci: async (options: { type?: string }) => {
    const provider = await select({
      message: "select your CI provider",
      options: [
        { value: "github", label: "github actions" },
        { value: "gitlab", label: "gitlab CI" },
        { value: "circle", label: "circleCI" },
      ],
    });

    if (!provider || typeof provider !== "string") return;

    const type =
      options.type ||
      ((await select({
        message: "select workflow type",
        options: [
          { value: "standard", label: "standard (build/test/lint)" },
          { value: "release", label: "release (changesets/publishing)" },
          { value: "deploy", label: "deploy (vercel/platforms)" },
        ],
      })) as string);

    if (!type) return;

    const registryRoot = path.join(path.dirname(__dirname), "../../registry");
    const templatePath = path.resolve(registryRoot, `setup/ci/${provider}/${type}.yml`);

    // CircleCI uses .circleci/config.yml, GitLab uses .gitlab-ci.yml
    let targetPath = path.join(process.cwd(), ".github/workflows/ci.yml");
    if (provider === "github") {
      targetPath = path.join(process.cwd(), `.github/workflows/${type}.yml`);
    } else if (provider === "gitlab") {
      targetPath = path.join(process.cwd(), ".gitlab-ci.yml");
    } else if (provider === "circle") {
      targetPath = path.join(process.cwd(), ".circleci/config.yml");
    }

    if (!fs.existsSync(templatePath)) {
      logger.error(`Template ${color.yellow(type)} for ${color.cyan(provider)} not found.`);
      return;
    }

    if (fs.existsSync(targetPath)) {
      const overwrite = await confirm({
        message: `${path.relative(process.cwd(), targetPath)} already exists. overwrite?`,
        initialValue: false,
      });
      if (!overwrite) return;
    }

    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(templatePath, targetPath);
    logger.success(
      `Successfully generated ${color.bold(type)} workflow in ${color.underline(targetPath)}`,
    );
  },

  env: async (_options?: any) => {
    logger.warn(
      `'momo setup --env' is deprecated. Please use ${color.bold("momo integrate env")} instead.`,
    );
  },
};

export function registerSetupCommands(program: Command) {
  const setup = program
    .command(COMMANDS.setup)
    .description(DESCRIPTIONS.setup)
    .action(async () => {
      logger.info(
        `${color.bold("Coming Soon:")} Project setup and standardization tools will be available in a future update.`,
      );
      logger.info("Try 'momo setup --help' to see upcoming subcommands.");
    });

  setup
    .command(COMMANDS.setupProject)
    .description(DESCRIPTIONS.setupProject)
    .action(async () => await setupCommand.project());

  setup
    .command(COMMANDS.setupPublish)
    .description(DESCRIPTIONS.setupPublish)
    .action(async () => await setupCommand.publish());

  setup
    .command(COMMANDS.setupOpenSource)
    .description(DESCRIPTIONS.setupOpenSource)
    .action(async () => await setupCommand.openSource());

  setup
    .command(COMMANDS.setupCloseSource)
    .description(DESCRIPTIONS.setupCloseSource)
    .action(async () => await setupCommand.closeSource());

  setup
    .command(COMMANDS.setupCi)
    .description(DESCRIPTIONS.setupCi)
    .option("-t, --type <type>", "workflow type (standard, release, deploy)")
    .action(async (options) => await setupCommand.ci(options));

  setup
    .command("env")
    .description("Deprecated: use 'momo integrate env'")
    .action(async () => await setupCommand.env());
}
