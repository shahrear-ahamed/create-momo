import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import color from "picocolors";
import { fileOps } from "@/utils/file-ops.js";
import { logger } from "@/utils/logger.js";

const CONFIG_FILE_NAME = "momo.config.json";
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".momo");
const GLOBAL_CONFIG_PATH = path.join(GLOBAL_CONFIG_DIR, "config.json");

interface MomoConfig {
  scope?: string;
  packageScope?: string;
  author?: string;
  license?: string;
  manager?: string;
  [key: string]: any;
}

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
      return { ...defaultConfig };
    }
    try {
      const stored = await fileOps.readJson<MomoConfig>(configPath);
      return { ...defaultConfig, ...stored };
    } catch (error) {
      // Is file exists but is invalid?
      return { ...defaultConfig };
    }
  },

  save: async (config: MomoConfig) => {
    // defaults to saving to global unless local exists
    let targetPath = GLOBAL_CONFIG_PATH;
    const localPath = path.join(process.cwd(), CONFIG_FILE_NAME);

    if (fs.existsSync(localPath)) {
      targetPath = localPath;
    } else {
      // Ensure global dir exists
      await fs.ensureDir(GLOBAL_CONFIG_DIR);
    }

    await fileOps.writeJson(targetPath, config);
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
    config[key] = value;

    const savedPath = await configManager.save(config);
    logger.success(`Set ${key} to ${value}`);
    logger.info(`Saved to ${color.underline(savedPath)}`);
  },
};
