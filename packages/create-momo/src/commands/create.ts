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
  let targetDir = "";

  // 1. Ask for project name if not provided
  if (!projectName) {
    const name = await text({
      message: "What is the name of your monorepo?",
      placeholder: "my-momo-project",
      validate: (value) => {
        if (value === ".") return; // Allow .
        return validators.projectName(value);
      },
    });

    if (isCancel(name)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }
    projectName = name as string;
  } else {
    // Validate provided name (allow . for current dir)
    if (projectName !== ".") {
      const validationError = validators.projectName(projectName);
      if (validationError) {
        logger.error(`Invalid project name: ${validationError}`);
        process.exit(1);
      }
    }
  }

  // Resolve target directory
  if (projectName === ".") {
    targetDir = process.cwd();
    // If using current dir, use the folder name as the project name in package.json
    projectName = path.basename(targetDir);
  } else {
    targetDir = path.resolve(process.cwd(), projectName);
  }

  // 2. Check if directory exists and is empty
  const isEmpty = await fileOps.isEmpty(targetDir);
  if (!isEmpty) {
    const overwrite = await select({
      message: `Directory "${projectName === "." ? "Current Directory" : projectName}" is not empty. How would you like to proceed?`,
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

  // 3. Configuration (Scope)
  const scope = await text({
    message: "What is the package scope?",
    placeholder: "@momo",
    initialValue: `@${projectName.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}`,
    validate: validators.scopeName,
  });

  if (isCancel(scope)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  // 4. Scaffolding
  const spinner = createSpinner("Scaffolding project...");

  try {
    const cleanScope = (scope as string).replace("@", "");

    await fileOps.ensureDir(targetDir);

    // ROOT package.json
    await fileOps.writeJson(path.join(targetDir, "package.json"), {
      name: projectName,
      private: true,
      license: "MIT",
      scripts: {
        build: "turbo build",
        dev: "turbo dev",
        lint: "turbo lint",
        clean: "turbo clean",
        format: "biome format . --write",
        check: "biome check .",
        "type-check": "turbo type-check",
      },
      dependencies: {},
      devDependencies: {
        turbo: "latest",
        typescript: "^5.9.3",
        "@biomejs/biome": "latest",
      },
      packageManager: "pnpm@9.1.0",
      engines: {
        node: ">=18",
      },
    });

    // pnpm-workspace.yaml
    await fileOps.writeFile(
      path.join(targetDir, "pnpm-workspace.yaml"),
      `packages:
  - "apps/*"
  - "packages/*"
`,
    );

    // turbo.json
    await fileOps.writeJson(path.join(targetDir, "turbo.json"), {
      $schema: "https://turbo.build/schema.json",
      tasks: {
        build: {
          dependsOn: ["^build"],
          inputs: ["$TURBO_DEFAULT$", ".env*"],
          outputs: [".next/**", "!.next/cache/**", "dist/**"],
        },
        lint: {
          dependsOn: ["^lint"],
        },
        dev: {
          cache: false,
          persistent: true,
        },
        "type-check": {
          dependsOn: ["^type-check"],
        },
      },
    });

    // tsconfig.json (Base)
    await fileOps.writeJson(path.join(targetDir, "tsconfig.json"), {
      compilerOptions: {
        target: "ES2022",
        lib: ["DOM", "DOM.Iterable", "ESNext"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
      },
      exclude: ["node_modules", "dist"],
    });

    // .gitignore
    await fileOps.writeFile(
      path.join(targetDir, ".gitignore"),
      `# Dependencies
node_modules
.pnpm-store

# Next.js
.next
out

# Production
build
dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Env settings
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Turbo
.turbo
`,
    );

    // Create folders
    await fileOps.ensureDir(path.join(targetDir, "apps"));
    await fileOps.ensureDir(path.join(targetDir, "packages"));

    spinner.stop("Project scouted successfully!");

    logger.success(`\nProject created at ${color.underline(targetDir)}`);
    logger.info("\nNext steps:");
    if (targetDir !== process.cwd()) {
      logger.step(`  cd ${args.name || projectName}`);
    }
    logger.step("  pnpm install");
    logger.step("  pnpm dev");
  } catch (error) {
    spinner.stop("Failed to create project");
    logger.error((error as Error).message);
    process.exit(1);
  }
}
