import { execa } from "execa";
import color from "picocolors";
import { logger } from "@/utils/logger.js";

async function runTurbo(command: string) {
  try {
    logger.info(`Running ${color.cyan(`turbo ${command}`)}...`);
    await execa("turbo", [command], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (_error) {
    logger.error(`Failed to run ${command}`);
    process.exit(1);
  }
}

export const projectCommand = {
  build: async () => await runTurbo("build"),
  dev: async () => await runTurbo("dev"),
  lint: async () => await runTurbo("lint"),
  start: async () => await runTurbo("start"),
};
