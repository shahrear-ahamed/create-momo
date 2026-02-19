import os from "node:os";
import path from "node:path";
import type { Command } from "commander";
import fs from "fs-extra";
import color from "picocolors";
import { type MomoConfig, MomoConfigSchema } from "@/schemas/config.schema.js";
import { fileOps } from "@/utils/file-ops.js";
import { logger } from "@/utils/logger.js";

const CONFIG_FILE_NAME = "momo.config.json";
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".momo");
const GLOBAL_CONFIG_PATH = path.join(GLOBAL_CONFIG_DIR, "config.json");

const defaultConfig: MomoConfig = {
  scope: "@momo",
  author: "Anonymous",
  license: "MIT",
  manager: "pnpm",
};

export const configManager = {
  // Get config path (Local priority > Global)
  getPath: () => {
    const localPath = path.join(process.cwd(), CONFIG_FILE_NAME);
    if (fs.existsSync(localPath)) return localPath;
    return GLOBAL_CONFIG_PATH;
  },

  load: async (): Promise<MomoConfig> => {
    const configPath = configManager.getPath();
    if (!fs.existsSync(configPath)) {
      return MomoConfigSchema.parse(defaultConfig);
    }
    try {
      const stored = await fileOps.readJson<unknown>(configPath);
      const result = MomoConfigSchema.safeParse(stored);
      if (result.success) {
        return result.data;
      }
      logger.warn(`Invalid configuration in ${configPath}. Using defaults.`);
      return MomoConfigSchema.parse(defaultConfig);
    } catch (_error) {
      return MomoConfigSchema.parse(defaultConfig);
    }
  },

  save: async (config: MomoConfig) => {
    // Validate before saving
    const result = MomoConfigSchema.safeParse(config);
    if (!result.success) {
      throw new Error(`Invalid configuration: ${result.error.message}`);
    }

    let targetPath = GLOBAL_CONFIG_PATH;
    const localPath = path.join(process.cwd(), CONFIG_FILE_NAME);

    if (fs.existsSync(localPath)) {
      targetPath = localPath;
    } else {
      await fs.ensureDir(GLOBAL_CONFIG_DIR);
    }

    await fileOps.writeJson(targetPath, result.data);
    return targetPath;
  },
};

export const configCommand = {
  list: async () => {
    const config = await configManager.load();
    const configPath = configManager.getPath();

    logger.info(`Source: ${color.underline(configPath)}`);
    logger.info("Current Configuration:");
    Object.entries(config).forEach(([key, value]) => {
      console.log(`  ${color.cyan(key)}: ${value}`);
    });
  },

  get: async (key?: string) => {
    if (!key) {
      logger.error("Please provide a configuration key.");
      return;
    }
    const config = await configManager.load();
    const value = config[key];
    if (value === undefined) {
      logger.warn(`Key "${key}" not found.`);
    } else {
      logger.info(`${key}: ${value}`);
    }
  },

  set: async (key?: string, value?: string) => {
    if (!key || !value) {
      logger.error("Usage: momo config set <key> <value>");
      return;
    }

    const config = await configManager.load();
    const newConfig = { ...config, [key]: value };

    try {
      const savedPath = await configManager.save(newConfig);
      logger.success(`Set ${key} to ${value}`);
      logger.info(`Saved to ${color.underline(savedPath)}`);
    } catch (error) {
      logger.error((error as Error).message);
    }
  },
};

export function registerConfigCommand(program: Command) {
  const config = program
    .command("config")
    .description("Manage create-momo CLI settings")
    .action(async () => await configCommand.list());

  config
    .command("list")
    .description("List all configurations")
    .action(async () => await configCommand.list());

  config
    .command("get")
    .argument("<key>", "Configuration key")
    .action(async (key) => await configCommand.get(key));

  config
    .command("set")
    .argument("<key>", "Configuration key")
    .argument("<value>", "Configuration value")
    .action(async (key, value) => await configCommand.set(key, value));
}
