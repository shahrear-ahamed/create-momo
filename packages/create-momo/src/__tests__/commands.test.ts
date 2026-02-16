import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { COMMANDS, DESCRIPTIONS } from "../constants/commands.js";

// Mock dependencies
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
}));
vi.mock("../commands/config/config.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../commands/config/config.js")>();
  return {
    ...actual,
    configManager: {
      load: vi.fn().mockResolvedValue({ scope: "@momo", manager: "pnpm" }),
      save: vi.fn(),
    },
    configCommand: {
      list: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
    },
  };
});

describe("utility commands", () => {
  it("should register doctor, list, and update", async () => {
    const { registerUtilityCommands } = await import("../commands/utility/utility.js");

    const program = new Command();
    registerUtilityCommands(program);

    const registeredNames = program.commands.map((cmd) => cmd.name());
    expect(registeredNames).toContain(COMMANDS.doctor);
    expect(registeredNames).toContain(COMMANDS.list);
    expect(registeredNames).toContain(COMMANDS.update);
  });

  it("should have correct descriptions", async () => {
    const { registerUtilityCommands } = await import("../commands/utility/utility.js");

    const program = new Command();
    registerUtilityCommands(program);

    const doctorCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.doctor);
    const listCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.list);
    const updateCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.update);

    expect(doctorCmd?.description()).toBe(DESCRIPTIONS.doctor);
    expect(listCmd?.description()).toBe(DESCRIPTIONS.list);
    expect(updateCmd?.description()).toBe(DESCRIPTIONS.update);
  });
});

describe("config commands", () => {
  it("should register config with list, get, set subcommands", async () => {
    const { registerConfigCommand } = await import("../commands/config/config.js");

    const program = new Command();
    registerConfigCommand(program);

    const configCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.config);
    expect(configCmd).toBeDefined();
    expect(configCmd?.description()).toBe(DESCRIPTIONS.config);

    const subNames = configCmd?.commands.map((cmd) => cmd.name()) || [];
    expect(subNames).toContain(COMMANDS.configList);
    expect(subNames).toContain(COMMANDS.configGet);
    expect(subNames).toContain(COMMANDS.configSet);
  });
});

describe("setup commands", () => {
  it("should register setup with project, publish, open-source, close-source", async () => {
    const { registerSetupCommands } = await import("../commands/setup/setup.js");

    const program = new Command();
    registerSetupCommands(program);

    const setupCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.setup);
    expect(setupCmd).toBeDefined();
    expect(setupCmd?.description()).toBe(DESCRIPTIONS.setup);

    const subNames = setupCmd?.commands.map((cmd) => cmd.name()) || [];
    expect(subNames).toContain(COMMANDS.setupProject);
    expect(subNames).toContain(COMMANDS.setupPublish);
    expect(subNames).toContain(COMMANDS.setupOpenSource);
    expect(subNames).toContain(COMMANDS.setupCloseSource);
  });
});

describe("deploy commands", () => {
  it("should register deploy with init and push", async () => {
    const { registerDeployCommands } = await import("../commands/management/deploy.js");

    const program = new Command();
    registerDeployCommands(program);

    const deployCmd = program.commands.find((cmd) => cmd.name() === COMMANDS.deploy);
    expect(deployCmd).toBeDefined();
    expect(deployCmd?.description()).toBe(DESCRIPTIONS.deploy);

    const subNames = deployCmd?.commands.map((cmd) => cmd.name()) || [];
    expect(subNames).toContain(COMMANDS.deployInit);
    expect(subNames).toContain(COMMANDS.deployPush);
  });
});
