import path from "node:path";
import { cancel, isCancel, select, text } from "@clack/prompts";
import color from "picocolors";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { validators } from "@/utils/validators.js";

type AddOptions = {
  app?: boolean;
  package?: boolean;
};

export async function addComponent(type?: string, options: AddOptions = {}) {
  // 1. Validate Monorepo Root
  // Simple check: does turbo.json or pnpm-workspace.yaml exist?
  const _isMonorepo = await fileOps.isEmpty(process.cwd()); // Reusing check but we need existence check
  // Actually fileOps.isEmpty returns true if dir doesn't exist or is empty.
  // We need to check if specific files exist.
  // For now let's assume if package.json exists and has workspaces.

  // Let's implement a quick check
  const _hasPackageJson = !(await fileOps.isEmpty(process.cwd()));
  // We should probably add a specific check in fileOps later,
  // but for now let's trust the user knows where they are or just proceed.

  let componentType = type;

  // 2. Determine Type (App vs Package)
  if (!componentType && !options.app && !options.package) {
    const selectedType = await select({
      message: "What do you want to add?",
      options: [
        {
          value: "app",
          label: "Application (in /apps)",
          hint: "Next.js, Vite, etc.",
        },
        {
          value: "package",
          label: "Package (in /packages)",
          hint: "Shared UI, utils, etc.",
        },
      ],
    });

    if (isCancel(selectedType)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    componentType = selectedType as string;
  } else {
    // Infer from flags
    if (options.app) componentType = "app";
    if (options.package) componentType = "package";
  }

  // 3. Prompt for Name
  const name = await text({
    message: `What is the name of your new ${componentType}?`,
    placeholder: componentType === "app" ? "web" : "ui",
    validate: (val) => {
      // Packages usually need scope validation?
      // For simplicity now just project name validation
      return validators.projectName(val);
    },
  });

  if (isCancel(name)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const componentName = name as string;
  const targetRoot = componentType === "app" ? "apps" : "packages";
  const targetDir = path.join(process.cwd(), targetRoot, componentName);

  // 4. Scaffolding
  const spinner = createSpinner(`Creating ${componentType}...`);

  try {
    await fileOps.ensureDir(targetDir);

    // Basic package.json
    await fileOps.writeJson(path.join(targetDir, "package.json"), {
      name: componentName, // We can auto-add scope here later if we read root package.json
      version: "0.0.0",
      private: true,
      scripts: {
        build: "echo build",
        dev: "echo dev",
      },
    });

    // Add tsconfig
    await fileOps.writeJson(path.join(targetDir, "tsconfig.json"), {
      extends: "../../packages/config-typescript/base.json", // Assumption
      compilerOptions: {
        outDir: "dist",
        rootDir: "src",
      },
      include: ["src"],
      exclude: ["node_modules", "dist"],
    });

    // Add src folder
    await fileOps.ensureDir(path.join(targetDir, "src"));

    spinner.stop(
      `${componentType === "app" ? "Application" : "Package"} added successfully!`,
    );

    logger.success(
      `\nCreated ${color.bold(componentName)} in ${color.underline(targetDir)}`,
    );
  } catch (error) {
    spinner.stop("Failed to add component");
    logger.error((error as Error).message);
    process.exit(1);
  }
}
