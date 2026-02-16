import fs from "fs-extra";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { configManager } from "../commands/config/config.js";
import { fileOps } from "../utils/file-ops.js";

vi.mock("fs-extra");
vi.mock("../utils/file-ops.js", () => ({
  fileOps: {
    readJson: vi.fn(),
    writeJson: vi.fn(),
  },
}));

describe("configManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("load", () => {
    it("should return default config if file does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const config = await configManager.load();
      expect(config.scope).toBe("@momo");
      expect(config.manager).toBe("pnpm");
    });

    it("should return parsed config if file exists and is valid", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fileOps.readJson).mockResolvedValue({
        scope: "@custom",
        manager: "bun",
      });
      const config = await configManager.load();
      expect(config.scope).toBe("@custom");
      expect(config.manager).toBe("bun");
    });

    it("should return defaults if file is invalid", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fileOps.readJson).mockResolvedValue({
        manager: "invalid-pm",
      });
      const config = await configManager.load();
      expect(config.manager).toBe("pnpm"); // fallback to default
    });
  });

  describe("save", () => {
    it("should throw error if config is invalid", async () => {
      await expect(
        configManager.save({ manager: "invalid" } as any),
      ).rejects.toThrow();
    });

    it("should write valid config to file", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const validConfig = { scope: "@momo", manager: "pnpm" as const };
      await configManager.save(validConfig);
      expect(fileOps.writeJson).toHaveBeenCalled();
    });
  });
});
