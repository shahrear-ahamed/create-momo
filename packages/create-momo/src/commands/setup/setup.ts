import { COMMANDS, DESCRIPTIONS } from "@/constants/commands.js";
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

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const templatePath = path.resolve(
      __dirname,
      `../../templates/setup/ci/${provider}/${type}.yml`,
    );

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

  env: async (options: { t3?: boolean }) => {
    const rootDir = process.cwd();

    if (options.t3) {
      const config = (await fileOps.readJson(path.join(rootDir, "momo.config.json"))) as {
        scope: string;
      };
      const { scope } = config;
      const targetPath = path.join(rootDir, "packages/env");

      if (fs.existsSync(targetPath)) {
        const overwrite = await confirm({
          message: "packages/env already exists. overwrite?",
          initialValue: false,
        });
        if (!overwrite) return;
      }

      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const templatePath = path.resolve(__dirname, "../../templates/packages/env");

      await fs.ensureDir(targetPath);
      await fs.copy(templatePath, targetPath);

      // Replace scope in package.json
      const pkgPath = path.join(targetPath, "package.json");
      let pkgContent = await fs.readFile(pkgPath, "utf-8");
      pkgContent = pkgContent.replace("{{scope}}", scope);
      await fs.writeFile(pkgPath, pkgContent);

      logger.success(`Successfully scaffolded T3 Env package in ${color.underline(targetPath)}`);
      logger.info(
        "Don't forget to run 'pnpm install' and update your apps to import from '@momo/env'.",
      );
      return;
    }

    await fileOps.findFiles("**/ .env.example", rootDir);
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
    .command(COMMANDS.setupEnv)
    .description(DESCRIPTIONS.setupEnv)
    .option("--t3", "scaffold type-safe env using t3-env")
    .action(async (options) => await setupCommand.env(options));
}
