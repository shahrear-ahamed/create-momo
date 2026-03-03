import path from "node:path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { templateEngine } from "../template-engine.js";

describe("templateEngine", () => {
  const testDir = path.join(process.cwd(), "tmp-test-template");
  const templateDir = path.join(testDir, "template");
  const targetDir = path.join(testDir, "target");

  beforeEach(async () => {
    await fs.ensureDir(templateDir);
    await fs.writeFile(
      path.join(templateDir, "package.json"),
      '{"name": "{{name}}", "scope": "{{scope}}"}',
    );
    await fs.ensureDir(path.join(templateDir, "src"));
    await fs.writeFile(path.join(templateDir, "src/index.ts"), 'console.log("{{name}}")');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it("should copy template and replace placeholders", async () => {
    const options = { name: "test-app", scope: "@test" };
    await templateEngine.copyTemplate(templateDir, targetDir, options);

    const pkgJson = await fs.readJson(path.join(targetDir, "package.json"));
    expect(pkgJson.name).toBe("test-app");
    expect(pkgJson.scope).toBe("@test");

    const indexTs = await fs.readFile(path.join(targetDir, "src/index.ts"), "utf-8");
    expect(indexTs).toBe('console.log("test-app")');
  });
});
