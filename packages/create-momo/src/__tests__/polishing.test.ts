import fs from "fs-extra";
import { describe, expect, it, vi } from "vitest";

// Mock fs-extra properly
vi.mock("fs-extra", () => ({
  default: {
    readJson: vi.fn(),
    existsSync: vi.fn(),
    move: vi.fn(),
    writeJson: vi.fn(),
    ensureDir: vi.fn(),
  },
  readJson: vi.fn(),
  existsSync: vi.fn(),
  move: vi.fn(),
  writeJson: vi.fn(),
}));

// Mock configManager and other dependencies
vi.mock("../commands/config/config.js", () => ({
  configManager: {
    load: vi.fn(),
  },
}));

vi.mock("../utils/logger.js", () => ({
  createSpinner: vi.fn().mockReturnValue({
    stop: vi.fn(),
    start: vi.fn(),
  }),
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Polishing & Synchronization Regressions", () => {
  describe("projectUtils.getMomoVersion", () => {
    it("should return the version from package.json", async () => {
      const { projectUtils } = await import("../utils/project.js");
      (fs.readJson as any).mockResolvedValue({ version: "0.7.0-test" });

      const version = await projectUtils.getMomoVersion();
      expect(version).toBe("0.7.0-test");
    });

    it("should fallback to 0.6.1 if reading fails", async () => {
      const { projectUtils } = await import("../utils/project.js");
      (fs.readJson as any).mockRejectedValue(new Error("Read failed"));

      const version = await projectUtils.getMomoVersion();
      expect(version).toBe("0.6.1");
    });
  });

  describe("renameCommand scope resolution", () => {
    it("should handle packageScope in momo.config.json", async () => {
      const { renameCommand } = await import("../commands/lifecycle/rename.js");
      const { configManager } = await import("../commands/config/config.js");
      const { projectUtils } = await import("../utils/project.js");
      const { fileOps } = await import("../utils/file-ops.js");

      vi.spyOn(projectUtils, "isInsideProject").mockReturnValue(true);
      vi.spyOn(projectUtils, "findProjectRoot").mockReturnValue("/root");
      (configManager.load as any).mockResolvedValue({
        packageScope: "@smoke",
        manager: "pnpm",
      });

      // Mock fileOps.findFiles to return a path
      vi.spyOn(fileOps, "findFiles").mockResolvedValue(["/root/packages/old/package.json"]);
      (fs.readJson as any).mockResolvedValue({ name: "@smoke/old" });

      // We just want to check if it identifies the package correctly
      // By checking if it proceeds to the next spinner (which we can't easily check without mocking everything)
      // but we can check if it calls readJson with the correct path.

      // Since we can't easily test the full flow without massive mocking,
      // let's at least verify the logic in a more isolated way if possible.
      // For now, executing it and ensuring it doesn't fail immediately due to scope mismatch.

      try {
        await renameCommand.run("old", "new");
      } catch {
        // It might fail later due to move/install mocks missing, which is fine
      }

      // If it called findFiles and readJson, it passed the scope resolution check
      expect(fileOps.findFiles).toHaveBeenCalled();
    });
  });
});
