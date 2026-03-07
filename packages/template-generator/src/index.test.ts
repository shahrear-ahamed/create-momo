import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generator } from "../src/index.js";

describe("TemplateGenerator", () => {
  let tmpDir: string;
  let templateDir: string;
  let targetDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), "momo-test-" + Math.random().toString(36).slice(2));
    templateDir = path.join(tmpDir, "template");
    targetDir = path.join(tmpDir, "target");
    await fs.ensureDir(templateDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should generate files from templates", async () => {
    await fs.writeFile(path.join(templateDir, "hello.txt.hbs"), "Hello {{name}}!");

    await generator.generate({
      templateDir,
      targetDir,
      data: { name: "Momo" },
    });

    const content = await fs.readFile(path.join(targetDir, "hello.txt"), "utf-8");
    expect(content).toBe("Hello Momo!");
  });

  it("should merge JSON files", async () => {
    const jsonPath = path.join(targetDir, "package.json");
    await fs.outputJson(jsonPath, { name: "old", deps: { a: 1 } });

    await generator.mergeJson(jsonPath, { version: "1.0.0", deps: { b: 2 } });

    const merged = await fs.readJson(jsonPath);
    expect(merged.name).toBe("old");
    expect(merged.version).toBe("1.0.0");
    expect(merged.deps).toEqual({ a: 1, b: 2 });
  });
});
