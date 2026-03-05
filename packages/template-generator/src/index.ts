import fs from "fs-extra";
import Handlebars from "handlebars";
import path from "node:path";
import { glob } from "tinyglobby";

export interface GenerateOptions {
  templateDir: string;
  targetDir: string;
  data: Record<string, any>;
  overwrite?: boolean;
}

export class TemplateGenerator {
  /**
   * Generates files from a template directory using Handlebars.
   */
  async generate(options: GenerateOptions) {
    const { templateDir, targetDir, data, overwrite = false } = options;

    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    await fs.ensureDir(targetDir);

    // Find all files in template directory
    const files = await glob("**/*", {
      cwd: templateDir,
      dot: true,
      onlyFiles: true,
    });

    for (const file of files) {
      const srcPath = path.join(templateDir, file);

      // Determine destination path (handle .hbs extension removal)
      const relativeDestPath = file.endsWith(".hbs") ? file.slice(0, -4) : file;
      const destPath = path.join(targetDir, relativeDestPath);

      await fs.ensureDir(path.dirname(destPath));

      const isBinary = await this.isBinaryFile(srcPath);

      if (isBinary) {
        if (!fs.existsSync(destPath) || overwrite) {
          await fs.copy(srcPath, destPath);
        }
      } else {
        const content = await fs.readFile(srcPath, "utf-8");
        const template = Handlebars.compile(content);
        let result = template(data);

        // Smart merge for JSON files
        if (destPath.endsWith(".json") && fs.existsSync(destPath)) {
          try {
            const sourceJson = JSON.parse(result);
            await this.mergeJson(destPath, sourceJson);
            continue;
          } catch {
            // If not valid JSON or other error, fallback to overwrite/skip
          }
        }

        if (!fs.existsSync(destPath) || overwrite) {
          await fs.writeFile(destPath, result);
        }
      }
    }
  }

  /**
   * Merges two JSON files (deep merge for dependencies, scripts, etc.)
   */
  async mergeJson(targetPath: string, sourceJson: Record<string, any>) {
    const targetJson = await fs.readJson(targetPath);

    const merged = { ...targetJson };

    // Deep merge top-level keys
    for (const key of Object.keys(sourceJson)) {
      if (
        typeof sourceJson[key] === "object" &&
        sourceJson[key] !== null &&
        !Array.isArray(sourceJson[key])
      ) {
        merged[key] = { ...targetJson[key], ...sourceJson[key] };
      } else {
        merged[key] = sourceJson[key];
      }
    }

    await fs.writeJson(targetPath, merged, { spaces: 2 });
  }

  private async isBinaryFile(filePath: string): Promise<boolean> {
    // Simple heuristic: check if file has common binary extensions
    const binaryExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".ico",
      ".woff",
      ".woff2",
      ".ttf",
      ".eot",
      ".pdf",
      ".zip",
      ".tar",
      ".gz",
    ];
    return binaryExtensions.includes(path.extname(filePath).toLowerCase());
  }
}

export const generator = new TemplateGenerator();
