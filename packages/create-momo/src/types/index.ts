/**
 * Single source of truth for all CLI types.
 * Implementation and test files should import types from this module.
 */

// ─── Package Manager ─────────────────────────────────────────────────────────

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

// ─── Workspace ───────────────────────────────────────────────────────────────

export interface WorkspacePackage {
  name: string;
  path: string;
  type: "app" | "package";
  packageJson: Record<string, unknown>;
}

// ─── Turbo Options ───────────────────────────────────────────────────────────

export interface TurboOptions {
  filter?: string;
  [key: string]: unknown;
}

// ─── Add Command ─────────────────────────────────────────────────────────────

export interface AddOptions {
  app?: boolean | string;
  package?: boolean | string;
  dep?: boolean | string;
  toApp?: string;
  toPkg?: string;
  dev?: boolean;
  root?: boolean;
  flavor?: string;
}

export type AddDepOptions = AddOptions;

// ─── Create Command ──────────────────────────────────────────────────────────

export interface CreateProjectOptions {
  name?: string;
  cwd?: string;
  version?: string;
}
