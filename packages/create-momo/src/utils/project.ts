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
};
