import { intro } from "@clack/prompts";
import fs from "fs-extra";
import { describe, expect, it, vi } from "vitest";
import { getPkgInfo, showLogo } from "../utils/cli-utils.js";

vi.mock("fs-extra");
vi.mock("@clack/prompts");
vi.mock("gradient-string", () => ({
  default: () => ({
    multiline: (str: string) => str,
  }),
}));

describe("cli-utils", () => {
  describe("getPkgInfo", () => {
    it("should read package.json correctly", () => {
      const mockPkg = { version: "1.0.0" };
      vi.mocked(fs.readJsonSync).mockReturnValue(mockPkg);

      const pkg = getPkgInfo(import.meta.url);
      expect(pkg).toEqual(mockPkg);
      expect(fs.readJsonSync).toHaveBeenCalled();
    });
  });

  describe("showLogo", () => {
    it("should clear console and show logo", () => {
      const clearSpy = vi.spyOn(console, "clear").mockImplementation(() => {});

      showLogo();

      expect(clearSpy).toHaveBeenCalled();
      expect(intro).toHaveBeenCalled();
    });
  });
});
