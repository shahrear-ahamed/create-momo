import path from "node:path";
import * as prompts from "@clack/prompts";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addComponent } from "../commands/core/add.js";
import { createProject } from "../commands/core/create.js";

vi.mock("@clack/prompts", async (importOriginal) => {
  const actual = await importOriginal<typeof prompts>();
  return {
    ...actual,
    text: vi.fn(),
    select: vi.fn(),
    cancel: vi.fn(),
    isCancel: vi.fn(() => false),
    spinner: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
    })),
  };
});

describe("Blueprint Integration", () => {
  const testDir = path.join(process.cwd(), "tmp-integration-test");

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(path.resolve(testDir, ".."));
    await fs.remove(testDir);
  });

  it("should scaffold a minimal project from blueprint", async () => {
    vi.mocked(prompts.text).mockResolvedValueOnce("@test-scope"); // getProjectScope
    vi.mocked(prompts.select).mockResolvedValueOnce("pnpm"); // getPackageManager

    await createProject({
      name: "my-test-momo",
      blueprint: "momo-starter-minimal",
      version: "0.5.1",
    });

    const projectDir = path.join(testDir, "my-test-momo");
    expect(fs.existsSync(path.join(projectDir, "momo.config.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "turbo.json"))).toBe(true);

    const pkgJson = await fs.readJson(path.join(projectDir, "package.json"));
    expect(pkgJson.name).toBe("my-test-momo");
  });

  it("should add a Next.js app using component template", async () => {
    vi.mocked(prompts.text).mockResolvedValueOnce("@test-scope"); // Project scope
    vi.mocked(prompts.select).mockResolvedValueOnce("pnpm"); // PM

    await createProject({
      name: "my-app-project",
      blueprint: "momo-starter-minimal",
      version: "0.5.1",
    });

    const projectRoot = path.join(testDir, "my-app-project");
    process.chdir(projectRoot);

    // addComponent with all args provided doesn't prompt
    await addComponent("app", { flavor: "with-nextjs" }, "web-app");

    const appDir = path.join(projectRoot, "apps", "web-app");
    expect(fs.existsSync(path.join(appDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(appDir, "src/app/page.tsx"))).toBe(true);

    const appPkgJson = await fs.readJson(path.join(appDir, "package.json"));
    expect(appPkgJson.name).toBe("web-app");
  });
});
