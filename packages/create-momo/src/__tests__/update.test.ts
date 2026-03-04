import * as prompts from "@clack/prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configManager } from "../commands/config/config.js";
import { updateCommand } from "../commands/lifecycle/update.js";
import { fileOps } from "../utils/file-ops.js";
import { projectUtils } from "../utils/project.js";

// Mocks
vi.mock("../utils/project.js", () => ({
  projectUtils: {
    isInsideProject: vi.fn(),
    findProjectRoot: vi.fn(),
  },
}));

vi.mock("../commands/config/config.js", () => ({
  configManager: {
    load: vi.fn(),
  },
}));

vi.mock("../utils/file-ops.js", () => ({
  fileOps: {
    findFiles: vi.fn(),
  },
}));

vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@clack/prompts")>();
  return {
    ...actual,
    multiselect: vi.fn(),
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
  createSpinner: vi.fn(() => ({ stop: vi.fn(), message: vi.fn() })),
}));

// Mock process.exit
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

vi.mock("execa", () => ({
  execa: vi.fn(),
}));

describe("Update Command", () => {
  const rootDir = "/mock/root";
  const mockConfig = { scope: "@momo", manager: "pnpm" };

  beforeEach(() => {
    vi.mocked(projectUtils.isInsideProject).mockReturnValue(true);
    vi.mocked(projectUtils.findProjectRoot).mockReturnValue(rootDir);
    vi.mocked(configManager.load).mockResolvedValue(mockConfig as any);
  });

  it("should exit if not inside a project", async () => {
    vi.mocked(projectUtils.isInsideProject).mockReturnValue(false);
    await expect(updateCommand.run({})).rejects.toThrow("process.exit");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should exit cleanly if no outdated deps are found", async () => {
    vi.mocked(fileOps.findFiles).mockResolvedValue(["apps/web/package.json"]);

    // Mock package.json without deps
    vi.spyOn(fs, "readJson").mockResolvedValueOnce({ name: "web" });

    await expect(updateCommand.run({})).rejects.toThrow("process.exit");
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it("should correctly identify and update outdated dependencies", async () => {
    vi.mocked(fileOps.findFiles).mockResolvedValue([
      "apps/web/package.json",
      "packages/ui/package.json",
    ]);

    // Mock reading package.json files
    vi.spyOn(fs, "readJson").mockImplementation((p) => {
      const filePath = p as string;
      if (filePath.includes("web")) {
        return Promise.resolve({
          name: "web",
          dependencies: { react: "^18.0.0", "@momo/ui": "workspace:*" },
        });
      }
      return Promise.resolve({
        name: "@momo/ui",
        devDependencies: { typescript: "~4.9.0" },
      });
    });

    // Mock npm outdated output
    vi.mocked(execa).mockImplementation((...execaArgs: any[]) => {
      const [cmd, args, opts] = execaArgs;
      if (cmd === "npm" && args?.[0] === "outdated") {
        const cwd = opts?.cwd as string;
        if (cwd.includes("web")) {
          return Promise.resolve({
            stdout: JSON.stringify({
              react: { current: "18.0.0", latest: "18.2.0" },
            }),
          }) as any;
        }
        if (cwd.includes("ui")) {
          return Promise.resolve({
            stdout: JSON.stringify({
              typescript: { current: "4.9.5", latest: "5.0.0" },
            }),
          }) as any;
        }
      }
      // Mock the final install command
      return Promise.resolve({ stdout: "" }) as any;
    });

    // Select all deps in the prompt
    vi.mocked(prompts.multiselect).mockResolvedValueOnce([0, 1]);

    const writeJsonSpy = vi.spyOn(fs, "writeJson").mockResolvedValue(undefined);

    await updateCommand.run({});

    // Verify it wrote the correct versions with prefixes preserved
    expect(writeJsonSpy).toHaveBeenCalledWith(
      path.join(rootDir, "apps/web/package.json"),
      expect.objectContaining({
        dependencies: { react: "^18.2.0", "@momo/ui": "workspace:*" },
      }),
      { spaces: 2 },
    );

    expect(writeJsonSpy).toHaveBeenCalledWith(
      path.join(rootDir, "packages/ui/package.json"),
      expect.objectContaining({
        devDependencies: { typescript: "~5.0.0" },
      }),
      { spaces: 2 },
    );

    // Verify install was called
    expect(execa).toHaveBeenCalledWith("pnpm", ["install"], { cwd: rootDir });
  });

  it("should exit without changes if running in --check mode", async () => {
    vi.mocked(fileOps.findFiles).mockResolvedValue(["apps/web/package.json"]);
    vi.spyOn(fs, "readJson").mockResolvedValueOnce({
      name: "web",
      dependencies: { react: "^18.0.0" },
    });
    vi.mocked(execa).mockImplementation((...args: any[]) => {
      return Promise.resolve({
        stdout: JSON.stringify({ react: { current: "18.0.0", latest: "18.2.0" } }),
      }) as any;
    });

    await expect(updateCommand.run({ check: true })).rejects.toThrow("process.exit");
    expect(process.exit).toHaveBeenCalledWith(0);
    expect(prompts.multiselect).not.toHaveBeenCalled();
    expect(fs.writeJson).not.toHaveBeenCalled();
  });
});
