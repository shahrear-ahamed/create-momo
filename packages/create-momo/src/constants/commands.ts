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
  // Core
  add: "add",
  create: "create-momo",

  // Add subcommands
  addApp: "app",
  addPackage: "package",
  addDep: "dep",
  addDepAlias: "get",

  // Turbo-powered management
  build: "build",
  dev: "dev",
  lint: "lint",
  start: "start",
  test: "test",
  login: "login",
  logout: "logout",
  link: "link",
  unlink: "unlink",
  clean: "clean",
  graph: "graph",

  // Config
  config: "config",
  configList: "list",
  configGet: "get",
  configSet: "set",

  // Utility
  doctor: "doctor",
  list: "list",
  update: "update",

  // Setup
  setup: "setup",
  setupProject: "project",
  setupPublish: "publish",
  setupOpenSource: "open-source",
  setupCloseSource: "close-source",

  // Deploy
  deploy: "deploy",
  deployInit: "init",
  deployPush: "push",
} as const;

// ─── Command Descriptions ────────────────────────────────────────────────────

export const DESCRIPTIONS = {
  // Core
  add: "Add components or dependencies to the monorepo",
  addApp: "Add a new application",
  addPackage: "Add a new package",
  addDep: "Install a dependency",

  // Turbo-powered management
  build: "Build all packages in the monorepo",
  dev: "Run development mode for all packages",
  lint: "Lint all packages in the monorepo",
  start: "Start the production build for all packages",
  test: "Run tests across the workspace using Turborepo",
  login: "Log in to Turborepo (Remote Caching)",
  logout: "Log out from Turborepo",
  link: "Link project to Vercel Team (Remote Caching)",
  unlink: "Unlink project from Remote Caching",
  clean: "Recursive cleanup of build artifacts",
  graph: "Visualize the project dependency graph",

  // Config
  config: "Manage create-momo CLI settings",
  configList: "List all configurations",
  configGet: "Get a configuration value",
  configSet: "Set a configuration value",

  // Utility
  doctor: "Check project health",
  list: "List available component flavors",
  update: "Update configurations (Coming Soon)",

  // Setup
  setup: "Configure project-wide standards (Coming Soon)",
  setupProject: "Select pre-configured blueprint (Coming Soon)",
  setupPublish: "Configure npm publishing (Coming Soon)",
  setupOpenSource: "Add open-source files (Coming Soon)",
  setupCloseSource: "Configure for proprietary use (Coming Soon)",

  // Deploy
  deploy: "Deployment workflows (Coming Soon)",
  deployInit: "Initialize deployment config (Coming Soon)",
  deployPush: "Deploy to platform (Coming Soon)",
} as const;

// ─── Add Dep Flags ───────────────────────────────────────────────────────────

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
