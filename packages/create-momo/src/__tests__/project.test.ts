import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { COMMANDS, DESCRIPTIONS, GLOBAL_FLAGS } from "../constants/commands.js";

// Mock execa so no actual turbo process is spawned
vi.mock("execa", () => ({
  execa: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

// Mock logger to suppress output during tests
vi.mock("../utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

describe("project commands (turbo wrappers)", () => {
  describe("command registration", () => {
    it("should register graph and clean commands", async () => {
      // Dynamically import after mocks are set
      const { registerProjectCommands } = await import("../commands/management/project.js");

      const program = new Command();
      registerProjectCommands(program);

      const registeredNames = program.commands.map((cmd) => cmd.name());
      expect(registeredNames).toContain(COMMANDS.graph);
      expect(registeredNames).toContain(COMMANDS.clean);
    });

    it("should have correct descriptions from shared constants", async () => {
      const { registerProjectCommands } = await import("../commands/management/project.js");

      const program = new Command();
      registerProjectCommands(program);

      const graphCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.graph);
      const cleanCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.clean);

      expect(graphCmd?.description()).toBe(DESCRIPTIONS.graph);
      expect(cleanCmd?.description()).toBe(DESCRIPTIONS.clean);
    });

    it("should have --filter option on graph command", async () => {
      const { registerProjectCommands } = await import("../commands/management/project.js");

      const program = new Command();
      registerProjectCommands(program);

      const graphCmd = program.commands.find((c) => c.name() === COMMANDS.graph);
      const filterOption = graphCmd?.options.find((opt) => opt.long === GLOBAL_FLAGS.filter.long);
      expect(filterOption).toBeDefined();
      expect(filterOption?.short).toBe(GLOBAL_FLAGS.filter.short);
    });
  });

  describe("turbo execution", () => {
    it("should call execa with turbo and the command name", async () => {
      const { execa } = await import("execa");
      const { projectCommand } = await import("../commands/management/project.js");

      await projectCommand.build();
      expect(execa).toHaveBeenCalledWith(
        "npx",
        ["turbo", COMMANDS.build],
        expect.objectContaining({ stdio: "inherit" }),
      );
    });

    it("should pass --filter flag when provided", async () => {
      const { execa } = await import("execa");
      const { projectCommand } = await import("../commands/management/project.js");

      await projectCommand.dev({ filter: "web" });
      expect(execa).toHaveBeenCalledWith(
        "npx",
        ["turbo", COMMANDS.dev, GLOBAL_FLAGS.filter.long, "web"],
        expect.objectContaining({ stdio: "inherit" }),
      );
    });

    it("should forward additional arguments to turbo", async () => {
      const { execa } = await import("execa");
      const { projectCommand } = await import("../commands/management/project.js");

      await projectCommand.lint({}, ["--continue", "--force"]);
      expect(execa).toHaveBeenCalledWith(
        "npx",
        ["turbo", COMMANDS.lint, "--continue", "--force"],
        expect.objectContaining({ stdio: "inherit" }),
      );
    });

    it("should combine filter and additional args", async () => {
      const { execa } = await import("execa");
      const { projectCommand } = await import("../commands/management/project.js");

      await projectCommand.start({ filter: "api" }, ["--parallel"]);
      expect(execa).toHaveBeenCalledWith(
        "npx",
        ["turbo", COMMANDS.start, GLOBAL_FLAGS.filter.long, "api", "--parallel"],
        expect.objectContaining({ stdio: "inherit" }),
      );
    });
  });
});
