import { describe, expect, it } from "vitest";
import {
  CLI,
  COMMANDS,
  COMPONENT_TYPES,
  DESCRIPTIONS,
  FLAVORS,
  GLOBAL_FLAGS,
  TURBO_COMMANDS,
  WORKSPACE_DIRS,
} from "../constants/commands.js";

describe("shared constants", () => {
  describe("CLI metadata", () => {
    it("should have correct CLI name", () => {
      expect(CLI.name).toBe("create-momo");
    });

    it("should have a config file name", () => {
      expect(CLI.configFile).toBe("momo.config.json");
    });

    it("should default to pnpm", () => {
      expect(CLI.defaultManager).toBe("pnpm");
    });
  });

  describe("global flags", () => {
    it("should have filter flag with short and long forms", () => {
      expect(GLOBAL_FLAGS.filter.short).toBe("-f");
      expect(GLOBAL_FLAGS.filter.long).toBe("--filter");
      expect(GLOBAL_FLAGS.filter.flag).toContain("-f");
      expect(GLOBAL_FLAGS.filter.flag).toContain("--filter");
    });

    it("should have dev flag with short and long forms", () => {
      expect(GLOBAL_FLAGS.dev.short).toBe("-D");
      expect(GLOBAL_FLAGS.dev.long).toBe("--dev");
    });

    it("should have version flag", () => {
      expect(GLOBAL_FLAGS.version.short).toBe("-v");
      expect(GLOBAL_FLAGS.version.long).toBe("--version");
    });

    it("should have help flag", () => {
      expect(GLOBAL_FLAGS.help.short).toBe("-h");
      expect(GLOBAL_FLAGS.help.long).toBe("--help");
    });
  });

  describe("command names", () => {
    it("should have all core commands", () => {
      expect(COMMANDS.add).toBe("add");
      expect(COMMANDS.integrate).toBe("integrate");
      expect(COMMANDS.build).toBe("build");
      expect(COMMANDS.dev).toBe("dev");
      expect(COMMANDS.lint).toBe("lint");
      expect(COMMANDS.start).toBe("start");
    });

    it("should have add subcommands", () => {
      expect(COMMANDS.addApp).toBe("app");
      expect(COMMANDS.addPackage).toBe("package");
    });

    it("should have config subcommands", () => {
      expect(COMMANDS.config).toBe("config");
      expect(COMMANDS.configList).toBe("list");
      expect(COMMANDS.configGet).toBe("get");
      expect(COMMANDS.configSet).toBe("set");
    });

    it("should have utility commands", () => {
      expect(COMMANDS.doctor).toBe("doctor");
      expect(COMMANDS.list).toBe("list");
      expect(COMMANDS.update).toBe("update");
    });

    it("should have setup subcommands", () => {
      expect(COMMANDS.setup).toBe("setup");
      expect(COMMANDS.setupProject).toBe("project");
      expect(COMMANDS.setupPublish).toBe("publish");
      expect(COMMANDS.setupOpenSource).toBe("open-source");
      expect(COMMANDS.setupCloseSource).toBe("close-source");
    });

    it("should have deploy subcommands", () => {
      expect(COMMANDS.deploy).toBe("deploy");
      expect(COMMANDS.deployInit).toBe("init");
      expect(COMMANDS.deployPush).toBe("push");
    });

    it("should have integrate subcommands", () => {
      expect(COMMANDS.integrateShadcn).toBe("shadcn");
      expect(COMMANDS.integrateConvex).toBe("convex");
      expect(COMMANDS.integrateNextjs).toBe("nextjs");
      expect(COMMANDS.integrateTanstack).toBe("tanstack");
    });
  });

  describe("descriptions", () => {
    it("should have descriptions for all turbo commands", () => {
      expect(DESCRIPTIONS.build).toBeDefined();
      expect(DESCRIPTIONS.dev).toBeDefined();
      expect(DESCRIPTIONS.lint).toBeDefined();
      expect(DESCRIPTIONS.start).toBeDefined();
    });

    it("should have descriptions for add subcommands", () => {
      expect(DESCRIPTIONS.add).toBeDefined();
      expect(DESCRIPTIONS.addApp).toBeDefined();
      expect(DESCRIPTIONS.addPackage).toBeDefined();
    });

    it("should have descriptions for config, utility, setup, deploy, integrate", () => {
      expect(DESCRIPTIONS.config).toBeDefined();
      expect(DESCRIPTIONS.doctor).toBeDefined();
      expect(DESCRIPTIONS.setup).toBeDefined();
      expect(DESCRIPTIONS.deploy).toBeDefined();
      expect(DESCRIPTIONS.integrate).toBeDefined();
      expect(DESCRIPTIONS.integrateShadcn).toBeDefined();
    });
  });

  describe("turbo commands list", () => {
    it("should contain all five turbo-powered commands", () => {
      expect(TURBO_COMMANDS).toContain("build");
      expect(TURBO_COMMANDS).toContain("dev");
      expect(TURBO_COMMANDS).toContain("lint");
      expect(TURBO_COMMANDS).toContain("start");
      expect(TURBO_COMMANDS).toContain("test");
      expect(TURBO_COMMANDS).toHaveLength(5);
    });
  });

  describe("component types", () => {
    it("should have app, package, and config", () => {
      expect(COMPONENT_TYPES.app).toBe("app");
      expect(COMPONENT_TYPES.package).toBe("package");
      expect(COMPONENT_TYPES.config).toBe("config");
    });
  });

  describe("flavors", () => {
    it("should have all four flavors with value and label", () => {
      expect(FLAVORS.blank.value).toBe("blank");
      expect(FLAVORS.nextjs.value).toBe("nextjs");
      expect(FLAVORS.react.value).toBe("react");
      expect(FLAVORS.node.value).toBe("node");
    });
  });

  describe("workspace directories", () => {
    it("should have apps and packages directories", () => {
      expect(WORKSPACE_DIRS.apps).toBe("apps");
      expect(WORKSPACE_DIRS.packages).toBe("packages");
    });
  });
});
