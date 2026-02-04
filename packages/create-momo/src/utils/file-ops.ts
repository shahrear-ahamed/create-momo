import fs from "fs-extra";

export const fileOps = {
  /**
   * Check if a directory is empty
   */
  isEmpty: async (dir: string): Promise<boolean> => {
    if (!fs.existsSync(dir)) return true;
    const files = await fs.readdir(dir);
    return files.length === 0 || (files.length === 1 && files[0] === ".git");
  },

  /**
   * Ensure directory exists
   */
  ensureDir: async (dir: string): Promise<void> => {
    await fs.ensureDir(dir);
  },

  /**
   * Copy a template directory to destination
   */
  copyTemplate: async (
    src: string,
    dest: string,
    _variables?: Record<string, string>,
  ): Promise<void> => {
    await fs.copy(src, dest, {
      overwrite: true,
      errorOnExist: false,
    });

    // Simplistic variable replacement if needed?
    // Usually improved by iterating files, but for now simple copy is fine.
    // Enhanced template copying related to variables will be handled in separate function if needed.
  },

  /**
   * Write JSON file
   */
  writeJson: async (file: string, content: unknown): Promise<void> => {
    await fs.outputJson(file, content, { spaces: 2 });
  },

  /**
   * Read JSON file
   */
  readJson: async <T>(file: string): Promise<T> => {
    return fs.readJson(file);
  },

  /**
   * Write file
   */
  writeFile: async (file: string, content: string): Promise<void> => {
    await fs.outputFile(file, content);
  },
};
