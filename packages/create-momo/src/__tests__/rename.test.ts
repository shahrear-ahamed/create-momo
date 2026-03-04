import { execa } from "execa";
import fs from "fs-extra";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configManager } from "../commands/config/config.js";
import { renameCommand } from "../commands/lifecycle/rename.js";
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

vi.mock("execa", () => ({
  execa: vi.fn(),
}));

vi.mock("../utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
  },
  createSpinner: vi.fn(() => ({ stop: vi.fn(), message: vi.fn() })),
}));

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

describe("Rename Command", () => {
  const rootDir = "/mock/root";
  const mockConfig = { scope: "@momo", manager: "pnpm" };

  beforeEach(() => {
    vi.mocked(projectUtils.isInsideProject).mockReturnValue(true);
    vi.mocked(projectUtils.findProjectRoot).mockReturnValue(rootDir);
    vi.mocked(configManager.load).mockResolvedValue(mockConfig as any);
  });

  it("should exit if not inside a project", async () => {
    vi.mocked(projectUtils.isInsideProject).mockReturnValue(false);
    await expect(renameCommand.run("old", "new")).rejects.toThrow("process.exit");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should error if target package is not found", async () => {
    vi.mocked(fileOps.findFiles).mockResolvedValue(["apps/web/package.json"]);

    // Web package, but we're renaming 'missing-app'
    vi.spyOn(fs, "readJson").mockResolvedValueOnce({ name: "@momo/web" });

    await expect(renameCommand.run("missing-app", "new-app")).rejects.toThrow("process.exit");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should correctly update and rename target and references", async () => {
    vi.mocked(fileOps.findFiles).mockResolvedValue([
      "apps/web/package.json",
      "packages/ui/package.json",
    ]);

    vi.spyOn(fs, "readJson").mockImplementation((p) => {
      const filePath = p as string;
      if (filePath.includes("web")) {
        // Consumer
        return Promise.resolve({
          name: "@momo/web",
          dependencies: { "@momo/ui": "workspace:*" },
          devDependencies: { typescript: "^5.0.0" },
        });
      }
      // Target
      return Promise.resolve({
        name: "@momo/ui",
        peerDependencies: {},
      });
    });

    const writeJsonSpy = vi.spyOn(fs, "writeJson").mockResolvedValue(undefined);
    const moveSpy = vi.spyOn(fs, "move").mockResolvedValue(undefined);
    vi.mocked(execa).mockResolvedValue({} as any);

    await renameCommand.run("ui", "design-system");

    // Target UI package updated its name
    expect(writeJsonSpy).toHaveBeenCalledWith(
      path.join(rootDir, "packages/ui/package.json"),
      expect.objectContaining({ name: "@momo/design-system" }),
      { spaces: 2 },
    );

    // Consumer web package updated its reference
    expect(writeJsonSpy).toHaveBeenCalledWith(
      path.join(rootDir, "apps/web/package.json"),
      expect.objectContaining({
        dependencies: { "@momo/design-system": "workspace:*" },
      }),
      { spaces: 2 },
    );

    // Directory move called correctly
    expect(moveSpy).toHaveBeenCalledWith(
      path.join(rootDir, "packages/ui"),
      path.join(rootDir, "packages/design-system"),
    );

    // Install called
    expect(execa).toHaveBeenCalledWith("pnpm", ["install"], { cwd: rootDir });
  });
});
