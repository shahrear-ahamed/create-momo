import { createProject } from "@/commands/core/create.js";
import { getPkgInfo } from "@/utils/cli-utils.js";
import { Command } from "commander";

const pkg = getPkgInfo(import.meta.url);
const program = new Command();

async function main() {
  program
    .name("create-momo")
    .description("A modern CLI tool for scaffolding monorepo projects")
    .version(pkg.version, "-v, --version")
    .helpOption("-h, --help", "Show help")
    .argument("[project-name]", "Name of the project to create")
    .option("-t, --template <name>", "Specify a template to use")
    .option("-s, --scope <name>", "Specify the package scope")
    .option("-m, --manager <name>", "Specify the package manager (pnpm, npm, yarn, bun)")
    .option("-y, --yes", "Skip prompts and use defaults")
    .action(async (projectName: string | undefined, options: any) => {
      await createProject({
        name: projectName,
        template: options.template,
        scope: options.scope,
        manager: options.manager,
        yes: options.yes,
        version: pkg.version,
      });
    });

  program.parse();
}

main().catch(console.error);
