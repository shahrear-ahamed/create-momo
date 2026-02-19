import { Command } from "commander";
import { createProject } from "@/commands/core/create.js";
import { getPkgInfo, showLogo } from "@/utils/cli-utils.js";

const pkg = getPkgInfo(import.meta.url);
const program = new Command();

async function main() {
  showLogo();

  program
    .name("create-momo")
    .description("A modern CLI tool for scaffolding monorepo projects")
    .version(pkg.version, "-v, --version")
    .helpOption("-h, --help", "Show help")
    .argument("[project-name]", "Name of the project to create")
    .action(async (projectName: string | undefined) => {
      await createProject({ name: projectName, version: pkg.version });
    });

  program.parse();
}

main().catch(console.error);
