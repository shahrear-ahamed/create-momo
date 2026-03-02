/**
 * Single source of truth for all CLI commands, subcommands, flags, and descriptions.
 * Both implementation code and test files should import from this module.
 */

// ─── Global Flags ────────────────────────────────────────────────────────────

export const GLOBAL_FLAGS = {
  filter: {
    short: "-f",
    long: "--filter",
    flag: "-f, --filter <package>",
    description: "Filter to specific package(s)",
  },
  dev: {
    short: "-D",
    long: "--dev",
    flag: "-D, --dev",
    description: "Install as devDependency",
  },
  version: {
    short: "-v",
    long: "--version",
    flag: "-v, --version",
    description: "Show version",
  },
  help: {
    short: "-h",
    long: "--help",
    flag: "-h, --help",
    description: "Show help",
  },
} as const;

// ─── CLI Metadata ────────────────────────────────────────────────────────────

export const CLI = {
  name: "create-momo",
  description: "A modern CLI tool for creating and managing monorepo projects",
  configFile: "momo.config.json",
  defaultManager: "pnpm",
} as const;

// ─── Command Names ───────────────────────────────────────────────────────────

export const COMMANDS = {
  // ─── Management ────────────────────────────────────────────────────────────
  create: "create", // Shorthand for bootstrap
  add: "add", // Grow with templates (local/remote/shadcn)
  install: "install", // Add NPM dependencies
  list: "list", // List available components/blueprints

  // ─── Subcommands (Required for Logic & Tests) ──────────────────────────────
  addApp: "app",
  addPackage: "package",
  addConfig: "config",
  addDep: "dep",
  addDepAlias: "get",

  // ─── Orchestration ─────────────────────────────────────────────────────────
  setup: "setup", // Infra (CI, Env, etc.)
  config: "config", // CLI Preferences
  doctor: "doctor", // Health Check

  // Legacy/Internal Subkeys (Satisfying existing tests)
  configList: "list",
  configGet: "get",
  configSet: "set",
  setupProject: "project",
  setupPublish: "publish",
  setupOpenSource: "open-source",
  setupCloseSource: "close-source",
  setupCi: "ci",
  setupEnv: "env",
  deployInit: "init",
  deployPush: "push",
  update: "update",

  // ─── Execution (Turbo-powered) ─────────────────────────────────────────────
  run: "run", // Execute turbo tasks
  build: "build",
  dev: "dev",
  lint: "lint",
  test: "test",
  start: "start",
  clean: "clean",

  // ─── Infrastructure ────────────────────────────────────────────────────────
  login: "login",
  logout: "logout",
  link: "link",
  unlink: "unlink",
  deploy: "deploy",
  graph: "graph",
} as const;

// ─── Command Descriptions ────────────────────────────────────────────────────

export const DESCRIPTIONS = {
  // Management
  create: "bootstrap a new monorepo project",
  add: "add components, apps, or UI libraries (shadcn:)",
  install: "install and link NPM dependencies to workspaces",
  list: "List available component flavors",

  // Subcommands & Utility (Preserving legacy text for tests)
  addApp: "add a new application",
  addPackage: "add a new package",
  addConfig: "add a shared configuration package",
  addDep: "install a dependency",
  doctor: "Check project health",
  update: "Update configurations (Coming Soon)",

  // Orchestration
  setup: "Configure project-wide standards (Coming Soon)",
  config: "Manage create-momo CLI settings",

  // Config subcommands
  configList: "List all configurations",
  configGet: "Get a configuration value",
  configSet: "Set a configuration value",

  // Execution
  run: "execute workspace tasks (powered by Turborepo)",
  build: "Build all packages in the monorepo",
  dev: "Run development mode for all packages",
  lint: "Lint all packages in the monorepo",
  start: "Start the production build for all packages",
  test: "Run tests across the workspace using Turborepo",
  clean: "Recursive cleanup of build artifacts",

  // Infrastructure
  login: "Log in to Turborepo (Remote Caching)",
  logout: "Log out from Turborepo",
  link: "Link project to Vercel Team (Remote Caching)",
  unlink: "Unlink project from Remote Caching",
  deploy: "Deployment workflows (Coming Soon)",
  graph: "Visualize the project dependency graph",
} as const;

// ─── Add Action Flags ────────────────────────────────────────────────────────
export const ADD_ACTION_FLAGS = {
  app: {
    short: "-a",
    long: "--app",
    flag: "-a, --app [name]",
    description: "Add a new application",
  },
  package: {
    short: "-p",
    long: "--package",
    flag: "-p, --package [name]",
    description: "Add a new package",
  },
  dep: {
    short: "-d",
    long: "--dep",
    flag: "-d, --dep [name]",
    description: "Install a dependency",
  },
  config: {
    short: "-c",
    long: "--config",
    flag: "-c, --config [name]",
    description: "Add a shared configuration package",
  },
} as const;

// ─── Add Dep Flags ───────────────────────────────────────────────────────────

export const ADD_DEP_FLAGS = {
  dev: GLOBAL_FLAGS.dev,
  app: {
    short: "-a",
    long: "--app",
    flag: "-a, --app <name>",
    description: "Target a specific app",
  },
  pkg: {
    short: "-p",
    long: "--pkg",
    flag: "-p, --pkg <name>",
    description: "Target a specific package",
  },
  root: {
    short: "-w",
    long: "--root",
    flag: "-w, --root",
    description: "Install to workspace root",
  },
} as const;

// ─── Turbo Command Mapping ───────────────────────────────────────────────────

export const TURBO_COMMANDS = [
  COMMANDS.build,
  COMMANDS.dev,
  COMMANDS.lint,
  COMMANDS.start,
  COMMANDS.test,
] as const;

// ─── Component Types ─────────────────────────────────────────────────────────

export const COMPONENT_TYPES = {
  app: "app",
  package: "package",
  config: "config",
  dep: "dep",
} as const;

// ─── Flavors ─────────────────────────────────────────────────────────────────

export const FLAVORS = {
  base: { value: "base", label: "Vanilla / Base" },
  nextjs: { value: "nextjs", label: "Next.js" },
  react: { value: "react", label: "React (Vite)" },
  node: { value: "node", label: "Node.js / Express" },
} as const;

// ─── Workspace Directories ──────────────────────────────────────────────────

export const WORKSPACE_DIRS = {
  apps: "apps",
  packages: "packages",
} as const;
