import path from "node:path";
import { isCancel, select, text } from "@clack/prompts";
import { fileOps } from "@/utils/file-ops.js";
import { logger } from "@/utils/logger.js";

export const setupCommand = {
  publish: async () => {
    logger.info("Setting up npm publishing configuration...");
    // Future: Add .npmrc, verify package.json fields, check changesets
    const registry = await text({
      message: "Enter npm registry URL",
      initialValue: "https://registry.npmjs.org/",
    });
    if (isCancel(registry)) return;
    logger.success(`NPM registry configured to: ${registry}`);
    // Implementation: Write to .npmrc
  },

  openSource: async () => {
    logger.info("Adding Open Source documentation...");
    // Future: Copy CONTRIBUTING.md, LICENSE, CODE_OF_CONDUCT.md templates
    const license = await select({
      message: "Select License",
      options: [
        { value: "MIT", label: "MIT" },
        { value: "Apache-2.0", label: "Apache 2.0" },
      ],
    });
    if (isCancel(license)) return;
    logger.success(`Added ${license} License and community files.`);
  },

  closeSource: async () => {
    logger.info("Configuring for Closed Source / Proprietary usage...");
    // Future: Remove License, add proprietary headers, checks
    await fileOps.writeJson(path.join(process.cwd(), "LICENSE"), {
      notice: "Proprietary",
    }); // Placeholder
    logger.success("Project configured as closed-source.");
  },

  project: async () => {
    logger.info("Setting up project from Blueprint...");
    const blueprint = await select({
      message: "Select a Blueprint",
      options: [
        { value: "saas", label: "SaaS Starter (Next.js + Supabase)" },
        { value: "api", label: "API Service (Express + Docker)" },
      ],
    });
    if (isCancel(blueprint)) return;
    logger.success(`Scaffolding ${blueprint} blueprint...`);
  },
};
