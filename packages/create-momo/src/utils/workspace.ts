import path from "node:path";
import fs from "fs-extra";

export interface WorkspacePackage {
  name: string;
  path: string;
  type: "app" | "package";
  packageJson: Record<string, unknown>;
}

export const workspaceUtils = {
  /**
   * Discovers all workspace packages from apps/ and packages/ directories.
   */
  async discoverWorkspaces(rootDir: string = process.cwd()): Promise<WorkspacePackage[]> {
    const workspaces: WorkspacePackage[] = [];
    const appsDir = path.join(rootDir, "apps");
    const packagesDir = path.join(rootDir, "packages");

    // Discover apps
    if (fs.existsSync(appsDir)) {
      const apps = await fs.readdir(appsDir);
      for (const app of apps) {
        const appPath = path.join(appsDir, app);
        const pkgJsonPath = path.join(appPath, "package.json");
        if (fs.existsSync(pkgJsonPath)) {
          const packageJson = await fs.readJson(pkgJsonPath);
          workspaces.push({
            name: packageJson.name || app,
            path: appPath,
            type: "app",
            packageJson,
          });
        }
      }
    }

    // Discover packages
    if (fs.existsSync(packagesDir)) {
      const packages = await fs.readdir(packagesDir);
      for (const pkg of packages) {
        const pkgPath = path.join(packagesDir, pkg);
        const pkgJsonPath = path.join(pkgPath, "package.json");
        if (fs.existsSync(pkgJsonPath)) {
          const packageJson = await fs.readJson(pkgJsonPath);
          workspaces.push({
            name: packageJson.name || pkg,
            path: pkgPath,
            type: "package",
            packageJson,
          });
        }
      }
    }

    return workspaces;
  },

  /**
   * Finds a workspace package by name or directory name.
   */
  async findWorkspace(
    nameOrDir: string,
    rootDir: string = process.cwd(),
  ): Promise<WorkspacePackage | null> {
    const workspaces = await this.discoverWorkspaces(rootDir);
    return (
      workspaces.find((ws) => ws.name === nameOrDir || path.basename(ws.path) === nameOrDir) || null
    );
  },

  /**
   * Checks if a package name is an internal workspace package.
   */
  async isInternalPackage(packageName: string, rootDir: string = process.cwd()): Promise<boolean> {
    const workspaces = await this.discoverWorkspaces(rootDir);
    return workspaces.some((ws) => ws.name === packageName);
  },
};
