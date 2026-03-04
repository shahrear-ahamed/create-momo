import { configManager } from "@/commands/config/config.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import color from "picocolors";

export const renameCommand = {
  run: async (oldName: string, newName: string) => {
    if (!projectUtils.isInsideProject()) {
      logger.error(`${color.bold("Not a Momo Project:")} Cannot find momo.config.json.`);
      process.exit(1);
    }

    const rootDir = projectUtils.findProjectRoot()!;
    const config = await configManager.load();
    const pm = config.manager || "pnpm";
    const activeScope = config.packageScope || config.scope || "";

    // Build the fully scoped names if the user didn't provide them
    const fullOldName = oldName.startsWith("@") ? oldName : `${activeScope}/${oldName}`;
    const fullNewName = newName.startsWith("@") ? newName : `${activeScope}/${newName}`;

    const spinner = createSpinner(`Searching for package ${color.cyan(fullOldName)}...`);

    try {
      const pkgPaths = await fileOps.findFiles("**/package.json", rootDir, [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
      ]);

      let targetPkgPath: string | null = null;
      const allPkgs: { path: string; data: any }[] = [];

      // 1. Scan memory
      for (const p of pkgPaths) {
        const fullPath = p;
        try {
          const pkgData = await fs.readJson(fullPath);
          allPkgs.push({ path: fullPath, data: pkgData });

          if (pkgData.name === fullOldName) {
            targetPkgPath = fullPath;
          }
        } catch (e) {
          // Ignore read/parse errors for now
        }
      }

      if (!targetPkgPath) {
        spinner.stop(`${color.red("Failed:")} Package not found.`);
        logger.error(
          `Could not find a package named ${color.bold(fullOldName)} in this workspace.`,
        );
        process.exit(1);
      }

      spinner.stop(`Found target package! Proceeding to rename to ${color.green(fullNewName)}.`);

      const updateSpinner = createSpinner("Updating references across workspace...");
      let updatedCount = 0;

      // 2. Perform updates in memory
      for (const pkg of allPkgs) {
        let isModified = false;

        // Check if it's the target package itself
        if (pkg.data.name === fullOldName) {
          pkg.data.name = fullNewName;
          isModified = true;
        }

        // Check dependencies
        if (pkg.data.dependencies && pkg.data.dependencies[fullOldName]) {
          pkg.data.dependencies[fullNewName] = pkg.data.dependencies[fullOldName];
          delete pkg.data.dependencies[fullOldName];
          isModified = true;
        }

        // Check devDependencies
        if (pkg.data.devDependencies && pkg.data.devDependencies[fullOldName]) {
          pkg.data.devDependencies[fullNewName] = pkg.data.devDependencies[fullOldName];
          delete pkg.data.devDependencies[fullOldName];
          isModified = true;
        }

        // Check peerDependencies
        if (pkg.data.peerDependencies && pkg.data.peerDependencies[fullOldName]) {
          pkg.data.peerDependencies[fullNewName] = pkg.data.peerDependencies[fullOldName];
          delete pkg.data.peerDependencies[fullOldName];
          isModified = true;
        }

        // Write changes
        if (isModified) {
          await fs.writeJson(pkg.path, pkg.data, { spaces: 2 });
          updatedCount++;
        }
      }

      updateSpinner.stop(`Updated ${updatedCount} package.json file(s).`);

      // 3. Update source code references (imports, etc.)
      const refactorSpinner = createSpinner("Refactoring source code imports...");
      const srcFiles = await fileOps.findFiles("**/*.{ts,tsx,js,jsx,json,md,yml,yaml}", rootDir, [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/package.json", // already handled
      ]);

      let refactoredCount = 0;
      for (const file of srcFiles) {
        try {
          const content = await fs.readFile(file, "utf-8");
          if (content.includes(fullOldName)) {
            const newContent = content.split(fullOldName).join(fullNewName);
            await fs.writeFile(file, newContent, "utf-8");
            refactoredCount++;
          }
        } catch (e) {
          // Skip if binary or unreadable
        }
      }
      refactorSpinner.stop(`Refactored ${refactoredCount} source file(s).`);

      // 4. Rename the physical folder if it matches the short oldName
      const targetDir = path.dirname(targetPkgPath);
      const shortOldName = oldName.split("/").pop() || oldName;
      const shortNewName = newName.split("/").pop() || newName;

      if (path.basename(targetDir) === shortOldName) {
        const parentDir = path.dirname(targetDir);
        const newTargetDir = path.join(parentDir, shortNewName);

        const moveSpinner = createSpinner(`Moving directory...`);
        try {
          await fs.move(targetDir, newTargetDir);
          moveSpinner.stop(`Directory renamed to ${color.cyan(shortNewName)}.`);
        } catch (err) {
          moveSpinner.stop(
            `${color.yellow("Warning:")} Could not rename directory on disk. Proceeding anyway.`,
          );
        }
      }

      // 4. Re-install to rebuild lockfile and symlinks
      const installSpinner = createSpinner(`Running ${pm} install to rewire workspace...`);
      try {
        await execa(pm, ["install"], { cwd: rootDir });
        installSpinner.stop("Workspace rewired successfully.");

        logger.success(
          `\nSuccessfully renamed ${color.cyan(fullOldName)} to ${color.green(fullNewName)}!`,
        );
      } catch (e) {
        installSpinner.stop(`${color.red("Failed:")} Error updating lockfile.`);
        logger.error(
          `Please run ${color.cyan(`${pm} install`)} manually to resolve workspace linking.`,
        );
        process.exit(1);
      }
    } catch (error) {
      spinner.stop(`${color.red("Error:")} An unexpected error occurred.`);
      logger.error(`${(error as Error).stack}`);
      process.exit(1);
    }
  },
};
