import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { COMMANDS, DESCRIPTIONS } from "../constants/commands.js";

// Mock dependencies
vi.mock("@clack/prompts", () => ({
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
}));

vi.mock("execa", () => ({
  execa: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

vi.mock("fs-extra", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    readJson: vi.fn().mockResolvedValue({}),
    readdir: vi.fn().mockResolvedValue([]),
  },
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

vi.mock("../commands/config/config.js", () => ({
  configManager: {
    load: vi.fn().mockResolvedValue({ scope: "@momo", manager: "pnpm" }),
  },
}));

describe("integrate command", () => {
  describe("command registration", () => {
    it("should register the integrate command", async () => {
      const { registerIntegrateCommand } = await import("../commands/core/integrate.js");

      const program = new Command();
      registerIntegrateCommand(program);

      const integrateCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.integrate);
      expect(integrateCmd).toBeDefined();
      expect(integrateCmd?.description()).toBe(DESCRIPTIONS.integrate);
    });

    it("should register integrate subcommands", async () => {
      const { registerIntegrateCommand } = await import("../commands/core/integrate.js");

      const program = new Command();
      registerIntegrateCommand(program);

      const integrateCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.integrate);
      const subNames = integrateCmd?.commands.map((c) => c.name()) || [];
      expect(subNames).toContain(COMMANDS.integrateShadcn);
      expect(subNames).toContain(COMMANDS.integrateConvex);
      expect(subNames).toContain(COMMANDS.integrateNextjs);
      expect(subNames).toContain(COMMANDS.integrateTanstack);
    });
  });
});
