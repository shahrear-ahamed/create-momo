import { configManager } from "@/commands/config/config.js";
import { fileOps } from "@/utils/file-ops.js";
import { createSpinner, logger } from "@/utils/logger.js";
import { projectUtils } from "@/utils/project.js";
import { cancel, isCancel, multiselect } from "@clack/prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import color from "picocolors";

interface OutdatedDep {
  name: string;
  current: string;
  latest: string;
  type: "dependencies" | "devDependencies" | "peerDependencies";
  pkgPath: string; // the package.json path
  workspaceName: string; // name in package.json
  isWorkspaceDep: boolean; // e.g. "workspace:^" or "@momo/*"
}

export const updateCommand = {
  run: async (options: { check?: boolean; all?: boolean; filter?: string }) => {
    if (!projectUtils.isInsideProject()) {
      logger.error(`${color.bold("Not a Momo Project:")} Cannot find momo.config.json.`);
      process.exit(1);
    }

    const rootDir = projectUtils.findProjectRoot()!;
    const config = await configManager.load();
    const pm = config.manager || "pnpm";

    const spinner = createSpinner("Analyzing workspace dependencies...");

    // 1. Gather all package.jsons
    const pkgPaths = await fileOps.findFiles("**/package.json", rootDir, [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
    ]);

    let allDeps: OutdatedDep[] = [];

    // 2. Read them all and check npm outdated for each
    for (const p of pkgPaths) {
      const fullPath = path.join(rootDir, p);
      const pkg = await fs.readJson(fullPath);

      // Skip if filter doesn't match
      if (options.filter && pkg.name !== options.filter && !pkg.name?.includes(options.filter)) {
        continue;
      }

      spinner.message(`Checking dependencies for ${color.cyan(pkg.name || p)}...`);

      const checkTypes = ["dependencies", "devDependencies", "peerDependencies"] as const;

      let outdatedData: Record<string, any> = {};
      try {
        // We use npm for checking registry regardless of local PM, the output format is reliable
        const { stdout } = await execa("npm", ["outdated", "--json"], {
          cwd: path.dirname(fullPath),
          reject: false,
        });
        if (stdout) {
          outdatedData = JSON.parse(stdout);
        }
      } catch (e) {
        // Ignore errors for individual packages
      }

      for (const type of checkTypes) {
        if (!pkg[type]) continue;

        for (const [depName, info] of Object.entries(outdatedData)) {
          // If this dependency is in this type (dependencies/devDependencies)
          if (!pkg[type][depName]) continue;

          // Skip workspace internal dependencies
          if (pkg[type][depName]?.includes("workspace:") || depName.startsWith(config.scope)) {
            continue;
          }

          // Only add if there is a newer version
          if (info.current !== info.latest && info.latest) {
            allDeps.push({
              name: depName,
              current: info.current || pkg[type][depName],
              latest: info.latest,
              type,
              pkgPath: fullPath,
              workspaceName: pkg.name || p,
              isWorkspaceDep: false,
            });
          }
        }
      }
    }

    spinner.stop("Dependency analysis complete.");

    if (allDeps.length === 0) {
      logger.success("All dependencies are up to date!");
      process.exit(0);
    }

    // 3. Display outdated dependencies
    logger.info(`Found ${color.yellow(allDeps.length.toString())} outdated dependencies:`);
    console.log();

    // Group by workspace for better display
    const grouped = allDeps.reduce(
      (acc, dep) => {
        if (!acc[dep.workspaceName]) acc[dep.workspaceName] = [];
        acc[dep.workspaceName].push(dep);
        return acc;
      },
      {} as Record<string, OutdatedDep[]>,
    );

    for (const [workspace, deps] of Object.entries(grouped)) {
      logger.info(color.bold(color.cyan(workspace)));
      for (const dep of deps) {
        console.log(
          `  ${dep.name.padEnd(30)} ${color.gray(dep.current)} → ${color.green(dep.latest)}`,
        );
      }
      console.log();
    }

    if (options.check) {
      logger.info(`Run ${color.cyan("momo update")} to upgrade these dependencies.`);
      process.exit(0);
    }

    // 4. Select what to update (unless --all)
    let selectedToUpdate = allDeps;

    if (!options.all) {
      const choices = allDeps.map((dep, index) => ({
        value: index,
        label: `${dep.name} (${dep.workspaceName})`,
        hint: `${dep.current} → ${dep.latest}`,
      }));

      const selectedIndices = await multiselect({
        message: "Select dependencies to update",
        options: choices,
        required: false,
      });

      if (
        isCancel(selectedIndices) ||
        (Array.isArray(selectedIndices) && selectedIndices.length === 0)
      ) {
        cancel("Update cancelled.");
        process.exit(0);
      }

      selectedToUpdate = (selectedIndices as number[]).map((i) => allDeps[i]);
    }

    // 5. Apply the updates
    const updateSpinner = createSpinner("Applying updates...");

    // Group back by file to minimize writes
    const filesToUpdate = selectedToUpdate.reduce(
      (acc, dep) => {
        if (!acc[dep.pkgPath]) acc[dep.pkgPath] = [];
        acc[dep.pkgPath].push(dep);
        return acc;
      },
      {} as Record<string, OutdatedDep[]>,
    );

    for (const [pkgPath, deps] of Object.entries(filesToUpdate)) {
      const pkg = await fs.readJson(pkgPath);

      for (const dep of deps) {
        // Keep the prefix if it exists (e.g. ^1.0.0 -> ^2.0.0) from the user's package.json
        const currentInPkg = pkg[dep.type][dep.name] as string;
        const prefix = currentInPkg.match(/^[^\d]/)?.[0] || "^";
        pkg[dep.type][dep.name] = `${prefix}${dep.latest}`;
      }

      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    updateSpinner.stop("package.json files updated.");

    // 6. Run install to update lockfile
    const installSpinner = createSpinner(`Running ${pm} install...`);
    try {
      await execa(pm, ["install"], { cwd: rootDir });
      installSpinner.stop("Lockfile updated successfully.");
      logger.success(`\nSuccessfully updated ${selectedToUpdate.length} dependencies!`);
    } catch (e) {
      installSpinner.stop(`${color.red("Failed:")} Error updating lockfile.`);
      logger.error(`Please run ${color.cyan(`${pm} install`)} manually to resolve the issue.`);
      process.exit(1);
    }
  },
};
