import color from "picocolors";
import { logger } from "@/utils/logger.js";

// Mock configuration store (in memory for now, usually reads from ~/.momo/config.json)
// In a real app, use 'conf' or 'dot-json' package.
const defaultConfig = {
  scope: "@momo",
  author: "Anonymous",
  license: "MIT",
  manager: "pnpm",
};

// We'll mimic a config store here
const configStore = { ...defaultConfig };

export const configCommand = {
  list: async () => {
    logger.info("Current Configuration:");
    Object.entries(configStore).forEach(([key, value]) => {
      console.log(`  ${color.cyan(key)}: ${value}`);
    });
  },

  get: async (key?: string) => {
    if (!key) {
      logger.error("Please provide a configuration key.");
      return;
    }
    // @ts-expect-error
    const value = configStore[key];
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
    // @ts-expect-error
    configStore[key] = value;
    logger.success(`Set ${key} to ${value}`);
  },
};
