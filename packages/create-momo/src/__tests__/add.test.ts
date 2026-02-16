import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { ADD_DEP_FLAGS, COMMANDS, DESCRIPTIONS } from "../constants/commands.js";

// Mock dependencies to isolate registration tests
vi.mock("execa", () => ({
  execa: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));
vi.mock("fs-extra", () => ({
  default: { existsSync: vi.fn().mockReturnValue(true) },
}));
vi.mock("../utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
  createSpinner: vi.fn().mockReturnValue({
    start: vi.fn(),
    stop: vi.fn(),
  }),
}));
vi.mock("../utils/file-ops.js", () => ({
  fileOps: {
    ensureDir: vi.fn(),
    writeJson: vi.fn(),
    readJson: vi.fn(),
    isEmpty: vi.fn().mockResolvedValue(true),
  },
}));
vi.mock("../commands/config/config.js", () => ({
  configManager: {
    load: vi.fn().mockResolvedValue({ scope: "@momo", manager: "pnpm" }),
    save: vi.fn(),
  },
}));
vi.mock("../utils/workspace.js", () => ({
  workspaceUtils: {
    discoverWorkspaces: vi.fn().mockResolvedValue([]),
    findWorkspace: vi.fn(),
    isInternalPackage: vi.fn().mockResolvedValue(false),
  },
}));

describe("add command", () => {
  describe("command registration", () => {
    it("should register the add command with subcommands", async () => {
      const { registerAddCommand } = await import("../commands/core/add.js");

      const program = new Command();
      registerAddCommand(program);

      const addCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.add);
      expect(addCmd).toBeDefined();
      expect(addCmd?.description()).toBe(DESCRIPTIONS.add);
    });

    it("should register app subcommand", async () => {
      const { registerAddCommand } = await import("../commands/core/add.js");

      const program = new Command();
      registerAddCommand(program);

      const addCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.add);
      const appSubCmd = addCmd?.commands.find((cmd) => cmd.name() === COMMANDS.addApp);
      expect(appSubCmd).toBeDefined();
      expect(appSubCmd?.description()).toBe(DESCRIPTIONS.addApp);
    });

    it("should register package subcommand", async () => {
      const { registerAddCommand } = await import("../commands/core/add.js");

      const program = new Command();
      registerAddCommand(program);

      const addCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.add);
      const pkgSubCmd = addCmd?.commands.find((cmd) => cmd.name() === COMMANDS.addPackage);
      expect(pkgSubCmd).toBeDefined();
      expect(pkgSubCmd?.description()).toBe(DESCRIPTIONS.addPackage);
    });

    it("should register dep subcommand with alias", async () => {
      const { registerAddCommand } = await import("../commands/core/add.js");

      const program = new Command();
      registerAddCommand(program);

      const addCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.add);
      const depSubCmd = addCmd?.commands.find((cmd) => cmd.name() === COMMANDS.addDep);
      expect(depSubCmd).toBeDefined();
      expect(depSubCmd?.description()).toBe(DESCRIPTIONS.addDep);
      expect(depSubCmd?.alias()).toBe(COMMANDS.addDepAlias);
    });

    it("should have correct dep flags from shared constants", async () => {
      const { registerAddCommand } = await import("../commands/core/add.js");

      const program = new Command();
      registerAddCommand(program);

      const addCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.add);
      const depSubCmd = addCmd?.commands.find((cmd) => cmd.name() === COMMANDS.addDep);
      const options = depSubCmd?.options || [];
      const optionLongs = options.map((o) => o.long);

      expect(optionLongs).toContain(ADD_DEP_FLAGS.dev.long);
      expect(optionLongs).toContain(ADD_DEP_FLAGS.app.long);
      expect(optionLongs).toContain(ADD_DEP_FLAGS.pkg.long);
      expect(optionLongs).toContain(ADD_DEP_FLAGS.root.long);
    });
  });
});
