export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export const getRootPackageJson = (
  name: string,
  packageManager: PackageManager,
  createMomoVersion: string,
) => {
  const isPnpm = packageManager === "pnpm";

  const base: Record<string, unknown> = {
    name,
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
      "create-momo": `^${createMomoVersion}`,
      turbo: "latest",
      typescript: "latest", // Always use latest typescript
      "@biomejs/biome": "latest",
    },
    engines: {
      node: ">=18",
    },
  };

  // Add workspaces config for non-pnpm package managers
  if (!isPnpm) {
    base.workspaces = ["apps/*", "packages/*"];
  }

  if (isPnpm) {
    base.packageManager = "pnpm@latest"; // Use latest pnpm
  }

  return base;
};
