import path from "node:path";
import { cancel, isCancel, select, text } from "@clack/prompts";
import color from "picocolors";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { validators } from "@/utils/validators.js";

export async function createProject(
  args: { name?: string; cwd?: string } = {},
) {
  let projectName = args.name;

  // 1. Ask for project name if not provided
  if (!projectName) {
    const name = await text({
      message: "What is the name of your monorepo?",
      placeholder: "my-momo-project",
      validate: validators.projectName,
    });

    if (isCancel(name)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    projectName = name as string;
  } else {
    // Validate provided name
    const validationError = validators.projectName(projectName);
    if (validationError) {
      logger.error(`Invalid project name: ${validationError}`);
      process.exit(1);
    }
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // 2. Check if directory exists and is empty
  const isEmpty = await fileOps.isEmpty(targetDir);
  if (!isEmpty) {
    const overwrite = await select({
      message: `Directory "${projectName}" is not empty. How would you like to proceed?`,
      options: [
        { value: "cancel", label: "Cancel operation" },
        { value: "ignore", label: "Ignore (files might be overwritten)" },
      ],
    });

    if (isCancel(overwrite) || overwrite === "cancel") {
      cancel("Operation cancelled.");
      process.exit(0);
    }
  }

  // 3. Select Template/Blueprint (Placeholder for now)
  // In Phase 3, we will add real templates.
  // For now, we will just create the directory.

  // 4. Configuration (Scope, etc.)
  const scope = await text({
    message: "What is the package scope?",
    placeholder: "@momo",
    initialValue: `@${projectName.split("/").pop()}`,
    validate: validators.scopeName,
  });

  if (isCancel(scope)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  // 5. Scaffolding
  const spinner = createSpinner("Scaffolding project...");

  try {
    await fileOps.ensureDir(targetDir);

    // Simulate copying template (Phase 3 will implement actual copy)
    await fileOps.writeJson(path.join(targetDir, "package.json"), {
      name: projectName,
      private: true,
      workspaces: ["apps/*", "packages/*"],
      scripts: {
        build: "turbo build",
        dev: "turbo dev",
        lint: "turbo lint",
      },
    });

    // Create folder structure
    await fileOps.ensureDir(path.join(targetDir, "apps"));
    await fileOps.ensureDir(path.join(targetDir, "packages"));

    spinner.stop("Project scouted successfully!");

    logger.success(`\nProject created at ${color.underline(targetDir)}`);
    logger.info("\nNext steps:");
    logger.step(`  cd ${projectName}`);
    logger.step("  pnpm install");
    logger.step("  pnpm dev");
  } catch (error) {
    spinner.stop("Failed to create project");
    logger.error((error as Error).message);
    process.exit(1);
  }
}
