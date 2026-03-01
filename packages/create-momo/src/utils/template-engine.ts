import path from "node:path";
import fs from "fs-extra";

export interface TemplateOptions {
  name: string;
  scope: string;
  packageManager?: string;
  pmVersion?: string;
  [key: string]: string | undefined;
}

export const templateEngine = {
  /**
   * Recursively copies a template directory to a target directory,
   * replacing placeholders in file contents.
   */
  copyTemplate: async (templateDir: string, targetDir: string, options: TemplateOptions) => {
    await fs.ensureDir(targetDir);
    const items = await fs.readdir(templateDir);

    for (const item of items) {
      const srcPath = path.join(templateDir, item);
      const destPath = path.join(targetDir, item);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        await templateEngine.copyTemplate(srcPath, destPath, options);
      } else {
        let content = await fs.readFile(srcPath, "utf-8");

        // Replace placeholders: {{key}} -> options[key]
        for (const [key, value] of Object.entries(options)) {
          if (value !== undefined) {
            const regex = new RegExp(`{{${key}}}`, "g");
            content = content.replace(regex, value);
          }
        }

        await fs.writeFile(destPath, content);
      }
    }
  },
};
