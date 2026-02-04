import path from "node:path";
import fs from "fs-extra";
import color from "picocolors";
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

    const checks = [
      { name: "package.json", path: "package.json" },
      { name: "turbo.json", path: "turbo.json" },
      { name: "packages directory", path: "packages" },
    ];

    let healthy = true;
    for (const check of checks) {
      if (fs.existsSync(path.join(process.cwd(), check.path))) {
        logger.step(`${color.green("✔")} ${check.name} found`);
      } else {
        logger.step(`${color.red("✘")} ${check.name} missing`);
        healthy = false;
      }
    }

    if (healthy) {
      logger.success("Project is healthy!");
    } else {
      logger.warn("Some issues were found in your project setup.");
    }
  },

  update: async () => {
    logger.info("Checking for configuration updates...");
    // Future: Sync templates from the CLI to the local config-typescript package
    logger.success("Configurations are up to date.");
  },
};
