import path from "node:path";
import { cancel, isCancel, select, text } from "@clack/prompts";
import type { Command } from "commander";
import color from "picocolors";
import { AddComponentSchema } from "@/schemas/commands.schema.js";
import { getBaseConfig } from "@/templates/config-typescript/base.json.js";
import { getNextjsConfig } from "@/templates/config-typescript/nextjs.json.js";
import { getNodeConfig } from "@/templates/config-typescript/node.json.js";
import { getConfigPackageJson } from "@/templates/config-typescript/package.json.js";
import { getReactConfig } from "@/templates/config-typescript/react.json.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { validators } from "@/utils/validators.js";

type AddOptions = {
  app?: boolean;
  package?: boolean;
};

export async function addComponent(type?: string, options: AddOptions = {}) {
  // Validate with Zod
  const validated = AddComponentSchema.parse({ type, options });
  let componentType = validated.type;

  // 1. Determine Type (App vs Package)
  if (
    !componentType &&
    !validated.options?.app &&
    !validated.options?.package
  ) {
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
    if (validated.options?.app) componentType = "app";
    if (validated.options?.package) componentType = "package";
  }

  // 2. Prompt for Name
  const name = await text({
    message: `What is the name of your new ${componentType}?`,
    placeholder: componentType === "app" ? "web" : "ui",
    validate: (val) => {
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

  // 3. Prompt for Flavor
  const flavor = await select({
    message: `Select the flavor for your ${componentType}`,
    options: [
      { value: "base", label: "Vanilla / Base" },
      { value: "nextjs", label: "Next.js" },
      { value: "react", label: "React (Vite)" },
      { value: "node", label: "Node.js / Express" },
    ],
  });

  if (isCancel(flavor)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  // 4. Scaffolding
  const spinner = createSpinner(`Creating ${componentType}...`);

  try {
    await fileOps.ensureDir(targetDir);

    // Basic package.json
    await fileOps.writeJson(path.join(targetDir, "package.json"), {
      name: componentName,
      version: "0.0.0",
      private: true,
      scripts: {
        build: "echo build",
        dev: "echo dev",
      },
    });

    // 4.1 Ensure config-typescript exists and has the requested flavor
    const configPkgDir = path.join(
      process.cwd(),
      "packages",
      "config-typescript",
    );
    const flavorFile = path.join(configPkgDir, `${flavor}.json`);

    // Existence checks
    const configExists = !(await fileOps.isEmpty(configPkgDir));
    if (!configExists) {
      await fileOps.ensureDir(configPkgDir);
      await fileOps.writeJson(
        path.join(configPkgDir, "package.json"),
        getConfigPackageJson("@momo"),
      );
      await fileOps.writeJson(
        path.join(configPkgDir, "base.json"),
        getBaseConfig(),
      );
    }

    // Check flavor file
    const flavorExists = await (async () => {
      try {
        await fileOps.readJson(flavorFile);
        return true;
      } catch {
        return false;
      }
    })();

    if (!flavorExists && flavor !== "base") {
      let configContent: Record<string, unknown> | undefined;
      if (flavor === "nextjs") configContent = getNextjsConfig();
      else if (flavor === "react") configContent = getReactConfig();
      else if (flavor === "node") configContent = getNodeConfig();

      if (configContent) {
        await fileOps.writeJson(flavorFile, configContent);
        logger.info(`Added ${color.cyan(`${flavor}.json`)} to shared config.`);
      }
    }

    // Add tsconfig to component
    const extendPath = `../../packages/config-typescript/${flavor}.json`;
    await fileOps.writeJson(path.join(targetDir, "tsconfig.json"), {
      extends: extendPath,
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

export function registerAddCommand(program: Command) {
  program
    .command("add")
    .description(
      "Scaffold a new app, package, or configuration into the monorepo",
    )
    .option("-a, --app", "Add a new application (Next.js, Vite, etc.)")
    .option(
      "-p, --package",
      "Add a new shared library or configuration package",
    )
    .action(async (type, options) => await addComponent(type, options));
}
