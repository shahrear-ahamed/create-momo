import { generator } from "@momo/template-generator";

export interface TemplateOptions {
  name: string;
  scope: string;
  packageManager?: string;
  pmVersion?: string;
  [key: string]: any;
}

export const templateEngine = {
  /**
   * Recursively copies a template directory to a target directory,
   * replacing placeholders in file contents using Handlebars.
   */
  copyTemplate: async (templateDir: string, targetDir: string, options: TemplateOptions) => {
    await generator.generate({
      templateDir,
      targetDir,
      data: options,
      overwrite: true,
    });
  },
};
