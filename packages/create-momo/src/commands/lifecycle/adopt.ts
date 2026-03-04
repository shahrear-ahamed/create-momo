import { configManager } from "@/commands/config/config.js";
import type { PackageManager } from "@/types/index.js";
import { logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";
import { cancel, confirm, isCancel } from "@clack/prompts";
import fs from "fs-extra";
import path from "node:path";
import color from "picocolors";

export async function runAdoptFlow(
  targetDir: string,
  projectName: string,
  scope: string,
  packageManager: PackageManager,
) {
  logger.info(`\n${color.blue("Adopt Mode:")} Detected an existing monorepo.`);

  const proceed = await confirm({
    message: `Adopt this project into Momo using scope ${color.cyan(scope)} and manager ${color.cyan(packageManager)}?`,
    initialValue: true,
  });

  if (isCancel(proceed) || !proceed) {
    cancel("Adoption cancelled.");
    process.exit(0);
  }

  // 1. Write momo.config.json
  const configPath = path.join(targetDir, "momo.config.json");
  await configManager.saveToPath(configPath, {
    scope,
    manager: packageManager,
  });
  logger.success(`Created ${color.cyan("momo.config.json")}`);

  // 2. Add turbo.json if missing
  const turboPath = path.join(targetDir, "turbo.json");
  if (!fs.existsSync(turboPath)) {
    const addTurbo = await confirm({
      message: `turbo.json is missing. Would you like to add a default Turborepo config?`,
      initialValue: true,
    });

    if (addTurbo && !isCancel(addTurbo)) {
      await fs.writeJson(
        turboPath,
        {
          $schema: "https://turbo.build/schema.json",
          ui: "tui",
          tasks: {
            build: { dependsOn: ["^build"], outputs: ["dist/**", ".next/**", "!.next/cache/**"] },
            lint: { dependsOn: ["^lint"] },
            dev: { cache: false, persistent: true },
            test: { dependsOn: ["^build"] },
          },
        },
        { spaces: 2 },
      );
      logger.success(`Created ${color.cyan("turbo.json")}`);
    }
  }

  logger.success(`\nProject adopted successfully!`);
  logger.info(
    `You can now use all Momo commands like ${color.cyan("momo add app")} or ${color.cyan("momo dev")}`,
  );
  process.exit(0);
}

export async function runMigrateFlow(
  targetDir: string,
  projectName: string,
  scope: string,
  packageManager: PackageManager,
) {
  logger.info(`\n${color.blue("Migrate Mode:")} Detected a single-app repository.`);

  logger.info(color.bold("\nMigration Plan:"));
  logger.step(`1. Move current source code into ${color.cyan(`apps/${projectName}`)}`);
  logger.step(`2. Create ${color.cyan("packages/")} directory`);
  logger.step(
    `3. Create monorepo root config (${color.cyan("package.json")}, ${color.cyan("pnpm-workspace.yaml")})`,
  );
  logger.step(`4. Initialize Momo and Turborepo`);

  const proceed = await confirm({
    message: "Execute this migration plan? (Files will be moved)",
    initialValue: true,
  });

  if (isCancel(proceed) || !proceed) {
    cancel("Migration cancelled.");
    process.exit(0);
  }

  try {
    const appsDir = path.join(targetDir, "apps");
    const packagesDir = path.join(targetDir, "packages");
    const newAppDir = path.join(appsDir, projectName);

    await fs.ensureDir(appsDir);
    await fs.ensureDir(packagesDir);
    await fs.ensureDir(newAppDir);

    // Read dir contents to move
    const files = await fs.readdir(targetDir);
    const ignoreList = [".git", "apps", "packages", "node_modules", ".DS_Store"];

    for (const file of files) {
      if (!ignoreList.includes(file)) {
        await fs.move(path.join(targetDir, file), path.join(newAppDir, file));
      }
    }

    // Update the moved package.json name to include scope if missing
    const appPkgPath = path.join(newAppDir, "package.json");
    if (fs.existsSync(appPkgPath)) {
      const appPkg = await fs.readJson(appPkgPath);
      if (!appPkg.name.startsWith(scope)) {
        appPkg.name = `${scope}/${appPkg.name}`;
        await fs.writeJson(appPkgPath, appPkg, { spaces: 2 });
      }
    }

    // Create root package.json
    const rootPkg = {
      name: `${scope}/root`,
      version: "0.0.0",
      private: true,
      scripts: {
        build: "momo build",
        dev: "momo dev",
        lint: "momo lint",
        test: "momo test",
        clean: "momo clean",
      },
      devDependencies: {
        turbo: "^2.3.0",
        typescript: "^5.0.0",
      },
      packageManager: `${packageManager}@${await projectUtils.getPMVersion(packageManager)}`,
    };
    await fs.writeJson(path.join(targetDir, "package.json"), rootPkg, { spaces: 2 });

    // Create workspace file
    if (packageManager === "pnpm") {
      await fs.writeFile(
        path.join(targetDir, "pnpm-workspace.yaml"),
        "packages:\n  - 'apps/*'\n  - 'packages/*'\n",
      );
    } // Handle others (yarn/npm) via package.json workspaces if needed

    // Write momo config
    const configPath = path.join(targetDir, "momo.config.json");
    await configManager.saveToPath(configPath, { scope, manager: packageManager });

    // Write turbo config
    await fs.writeJson(
      path.join(targetDir, "turbo.json"),
      {
        $schema: "https://turbo.build/schema.json",
        ui: "tui",
        tasks: {
          build: { dependsOn: ["^build"], outputs: ["dist/**", ".next/**", "!.next/cache/**"] },
          lint: { dependsOn: ["^lint"] },
          dev: { cache: false, persistent: true },
          test: { dependsOn: ["^build"] },
        },
      },
      { spaces: 2 },
    );

    logger.success(`\nProject migrated to monorepo successfully!`);
    logger.info(`Next steps:`);
    logger.step(`  ${packageManager} install`);
    logger.step(`  momo dev`);
    process.exit(0);
  } catch (error) {
    logger.error(`${color.red("Migration failed:")} ${(error as Error).message}`);
    process.exit(1);
  }
}
