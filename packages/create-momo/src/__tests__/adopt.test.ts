import * as prompts from "@clack/prompts";
import fs from "fs-extra";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configManager } from "../commands/config/config.js";
import { runAdoptFlow, runMigrateFlow } from "../commands/lifecycle/adopt.js";

// Mocks
vi.mock("@/commands/config/config.js", () => ({
  configManager: {
    saveToPath: vi.fn(),
  },
}));

vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clack/prompts")>();
  return {
    ...actual,
    confirm: vi.fn(),
    isCancel: vi.fn(),
    cancel: vi.fn(),
  };
});

vi.mock("@/utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
  },
}));

// Mock process.exit to prevent test runner from exiting
const originalExit = process.exit;
const exitError = new Error("process.exit");
beforeEach(() => {
  // @ts-ignore
  process.exit = vi.fn(() => {
    throw exitError;
  });
});
afterEach(() => {
  process.exit = originalExit;
  vi.clearAllMocks();
});

describe("Adopt Flow", () => {
  const targetDir = "/mock/target";
  const projectName = "mock-project";
  const scope = "@mockscope";
  const packageManager = "pnpm";

  it("should exit if user cancels confirmation", async () => {
    vi.mocked(prompts.confirm).mockResolvedValueOnce(false);

    await expect(runAdoptFlow(targetDir, projectName, scope, packageManager)).rejects.toThrow(
      "process.exit",
    );

    expect(prompts.cancel).toHaveBeenCalledWith("Adoption cancelled.");
    expect(process.exit).toHaveBeenCalledWith(0);
    expect(configManager.saveToPath).not.toHaveBeenCalled();
  });

  it("should create momo.config.json and optionally turbo.json when user says yes", async () => {
    vi.mocked(prompts.confirm).mockResolvedValue(true);
    vi.spyOn(fs, "existsSync").mockReturnValue(false); // turbo.json missing
    const writeJsonSpy = vi.spyOn(fs, "writeJson").mockResolvedValue(undefined);

    await expect(runAdoptFlow(targetDir, projectName, scope, packageManager)).rejects.toThrow(
      "process.exit",
    );

    expect(configManager.saveToPath).toHaveBeenCalledWith(
      path.join(targetDir, "momo.config.json"),
      { scope, manager: packageManager },
    );
    expect(writeJsonSpy).toHaveBeenCalledWith(
      path.join(targetDir, "turbo.json"),
      expect.any(Object),
      { spaces: 2 },
    );
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});

describe("Migrate Flow", () => {
  const targetDir = "/mock/migrate";
  const projectName = "mock-api";
  const scope = "@momo";
  const packageManager = "pnpm";

  it("should exit if user cancels migration", async () => {
    vi.mocked(prompts.confirm).mockResolvedValueOnce(false);
    await expect(runMigrateFlow(targetDir, projectName, scope, packageManager)).rejects.toThrow(
      "process.exit",
    );
    expect(prompts.cancel).toHaveBeenCalledWith("Migration cancelled.");
  });

  it("should perform full migration and move files", async () => {
    vi.mocked(prompts.confirm).mockResolvedValueOnce(true);

    // Mock fs operations for the happy path
    vi.spyOn(fs, "ensureDir").mockResolvedValue(undefined);
    vi.spyOn(fs, "readdir").mockResolvedValue(["src", "package.json", "node_modules"] as any);
    vi.spyOn(fs, "move").mockResolvedValue(undefined);
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const writeJsonSpy = vi.spyOn(fs, "writeJson").mockResolvedValue(undefined);
    const writeFileSpy = vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);
    vi.spyOn(fs, "readJson").mockResolvedValue({ name: "my-api", dependencies: {} });

    await expect(runMigrateFlow(targetDir, projectName, scope, packageManager)).rejects.toThrow(
      "process.exit",
    );

    // Ensure folders created
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(targetDir, "apps"));
    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(targetDir, "packages"));

    // Ensure files moved (excluding node_modules)
    expect(fs.move).toHaveBeenCalledWith(
      path.join(targetDir, "src"),
      path.join(targetDir, "apps", projectName, "src"),
    );
    expect(fs.move).not.toHaveBeenCalledWith(
      path.join(targetDir, "node_modules"),
      expect.any(String),
    );

    // Ensure app package.json updated with scope
    expect(writeJsonSpy).toHaveBeenCalledWith(
      path.join(targetDir, "apps", projectName, "package.json"),
      expect.objectContaining({ name: `${scope}/my-api` }),
      { spaces: 2 },
    );

    // Ensure root config written
    expect(configManager.saveToPath).toHaveBeenCalledWith(
      path.join(targetDir, "momo.config.json"),
      { scope, manager: packageManager },
    );

    // Ensure pnpm-workspace written
    expect(writeFileSpy).toHaveBeenCalledWith(
      path.join(targetDir, "pnpm-workspace.yaml"),
      expect.stringContaining("packages:"),
    );
  });
});
