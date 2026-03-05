import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    } catch {
      // Fallback versions if detection fails
      if (pm === "pnpm") return "9.0.0";
      if (pm === "yarn") return "1.22.0";
      if (pm === "bun") return "1.0.0";
      return "10.0.0"; // fallback for npm
    }
  },
  async getMomoVersion(): Promise<string> {
    try {
      // 1. Try environment variable (provided by npm/pnpm when running via bin)
      if (process.env.npm_package_version) {
        return process.env.npm_package_version;
      }

      // 2. Try to find package.json relative to the current module
      const __dirname = path.dirname(fileURLToPath(import.meta.url));

      // We look up to 4 levels to find package.json (handling various dist structures)
      let currentDir = __dirname;
      for (let i = 0; i < 4; i++) {
        const pkgPath = path.join(currentDir, "package.json");
        if (fs.existsSync(pkgPath)) {
          const pkg = await fs.readJson(pkgPath);
          if (pkg.name === "create-momo") return pkg.version;
        }
        currentDir = path.dirname(currentDir);
      }

      return "latest";
    } catch {
      return "latest";
    }
  },
};
