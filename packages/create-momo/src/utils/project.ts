import path from "node:path";
import fs from "fs-extra";

export const projectUtils = {
  /**
   * Finds the project root by looking for momo.config.json in current and parent directories.
   */
  findProjectRoot(dir: string = process.cwd()): string | null {
    let currentDir = dir;
    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, "momo.config.json"))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return null;
  },

  /**
   * Checks if the directory is already inside a momo project.
   */
  isInsideProject(dir: string = process.cwd()): boolean {
    return this.findProjectRoot(dir) !== null;
  },

  /**
   * Detects the current version of a package manager.
   */
  async getPMVersion(pm: string): Promise<string> {
    try {
      const { execa } = await import("execa");
      const { stdout } = await execa(pm, ["--version"]);
      return stdout.trim();
    } catch (_error) {
      // Fallback versions if detection fails
      if (pm === "pnpm") return "9.0.0";
      if (pm === "yarn") return "1.22.0";
      if (pm === "bun") return "1.0.0";
      return "10.0.0"; // fallback for npm
    }
  },
};
