import { describe, expect, it } from "vitest";
import { validators } from "../utils/validators.js";

describe("validators", () => {
  describe("projectName", () => {
    it("should accept valid project names", () => {
      expect(validators.projectName("my-project")).toBeUndefined();
      expect(validators.projectName("project123")).toBeUndefined();
      // "." is handled as a special case in the command, but the validator enforces valid npm package names
      expect(validators.projectName(".")).toContain("valid npm package name");
    });

    it("should reject empty names", () => {
      expect(validators.projectName("")).toBe("Project name cannot be empty");
      expect(validators.projectName(undefined)).toBe(
        "Project name cannot be empty",
      );
    });

    it("should reject invalid npm names", () => {
      expect(validators.projectName("My Project")).toContain(
        "valid npm package name",
      );
      expect(validators.projectName("project!")).toContain(
        "valid npm package name",
      );
    });

    it("should reject reserved names", () => {
      expect(validators.projectName("node_modules")).toBe(
        "Project name is reserved",
      );
    });
  });

  describe("scopeName", () => {
    it("should accept valid scopes", () => {
      expect(validators.scopeName("@momo")).toBeUndefined();
      expect(validators.scopeName("@my-org")).toBeUndefined();
    });

    it("should reject scopes not starting with @", () => {
      expect(validators.scopeName("momo")).toContain("start with @");
    });

    it("should reject invalid characters", () => {
      expect(validators.scopeName("@My Scope")).toContain("valid npm scope");
    });
  });
});
