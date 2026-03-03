import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { COMMANDS, GLOBAL_FLAGS } from "../constants/commands.js";

// Mock fs properly to simulate node_modules presence
vi.mock("fs-extra", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    ensureDir: vi.fn(),
    copy: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
  existsSync: vi.fn().mockReturnValue(true),
}));

// Mock execa
vi.mock("execa", () => ({
  execa: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

// Mock logger
vi.mock("../utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

// Mock configManager
vi.mock("../commands/config/config.js", () => ({
  configManager: {
    load: vi.fn().mockResolvedValue({ manager: "pnpm" }),
  },
}));

describe("run command & tasks", () => {
  describe("command registration", () => {
    it("should register run command and task shorthands", async () => {
      const { registerRunCommand } = await import("../commands/core/run.js");

      const program = new Command();
      registerRunCommand(program);

      const registeredNames = program.commands.map((cmd) => cmd.name());
      expect(registeredNames).toContain(COMMANDS.run);
      expect(registeredNames).toContain("build");
      expect(registeredNames).toContain("dev");
      expect(registeredNames).toContain("lint");
      expect(registeredNames).toContain("test");
      expect(registeredNames).toContain("start");
    });

    it("should have correct descriptions for shorthands", async () => {
      const { registerRunCommand } = await import("../commands/core/run.js");

      const program = new Command();
      registerRunCommand(program);

      const buildCmd = program.commands.find((cmd) => cmd.name() === "build");
      expect(buildCmd?.description()).toBe("Shorthand for 'momo run build'");
    });

    it("should have --filter option on all execution commands", async () => {
      const { registerRunCommand } = await import("../commands/core/run.js");

      const program = new Command();
      registerRunCommand(program);

      const execCommands = [COMMANDS.run, "build", "dev", "lint", "test", "start"];
      for (const cmdName of execCommands) {
        const cmd = program.commands.find((c) => c.name() === cmdName);
        const filterOption = cmd?.options.find((opt) => opt.long === GLOBAL_FLAGS.filter.long);
        expect(filterOption).toBeDefined();
      }
    });
  });

  describe("task execution", () => {
    it("should call execa with the correct package manager and args", async () => {
      const { execa } = await import("execa");
      const { runTask } = await import("../commands/core/run.js");

      await runTask("dev");
      expect(execa).toHaveBeenCalledWith(
        "pnpm",
        ["exec", "turbo", "dev", "--ui", "tui"],
        expect.objectContaining({ stdio: "inherit" }),
      );
    });

    it("should include filter if provided", async () => {
      const { execa } = await import("execa");
      const { runTask } = await import("../commands/core/run.js");

      await runTask("test", { filter: "utils" }, ["--watch"]);
      expect(execa).toHaveBeenCalledWith(
        "pnpm",
        ["exec", "turbo", "test", "--filter", "utils", "--watch"],
        expect.objectContaining({ stdio: "inherit" }),
      );
    });
  });
});
