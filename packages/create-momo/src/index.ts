import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro } from "@clack/prompts";
import { Command } from "commander";
import fs from "fs-extra";
import color from "picocolors";
import { addComponent } from "@/commands/add.js";
import { configCommand } from "@/commands/config.js";
import { setupCommand } from "@/commands/setup.js";
import { createProject } from "./commands/create.js";

// Read package.json dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = fs.readJsonSync(pkgPath);

const program = new Command();

async function main() {
  console.clear();

  intro(color.bgCyan(color.black(" MOMO ")));

  program
    .name("create-momo")
    .description(
      "A modern CLI tool for creating and managing monorepo projects",
    )
    .version(pkg.version, "-v, --version");

  // Create command (Explicit)
  program
    .command("create")
    .description("Create a new monorepo project")
    .argument("[project-name]", "Name of the project directory")
    .action(async (projectName) => await createProject({ name: projectName }));

  // Root command (implicit create)
  program
    .argument("[project-name]", "Name of the project directory")
    .action(async (projectName) => await createProject({ name: projectName }));

  // Add command
  program
    .command("add")
    .description("Add apps, packages, or configurations to existing project")
    .option("-a, --app", "Add an application")
    .option("-p, --package", "Add a package")
    .action(async (type, options) => await addComponent(type, options));

  // Setup command
  const setup = program
    .command("setup")
    .description("Setup configurations and project types");

  setup
    .command("publish")
    .description("Configure npm publishing")
    .action(async () => {
      await setupCommand.publish();
    });

  setup
    .command("open-source")
    .description("Add open-source files (LICENSE, CONTRIBUTING, etc.)")
    .action(async () => {
      await setupCommand.openSource();
    });

  setup
    .command("close-source")
    .description("Configure for proprietary use")
    .action(async () => {
      await setupCommand.closeSource();
    });

  setup
    .command("project")
    .description("Initialize from a blueprint")
    .action(async () => {
      await setupCommand.project();
    });

  // Config command
  const config = program.command("config").description("Manage configuration");

  config
    .command("list")
    .description("List all configurations")
    .action(async () => {
      await configCommand.list();
    });

  config
    .command("get")
    .argument("<key>", "Configuration key")
    .action(async (key) => {
      await configCommand.get(key);
    });

  config
    .command("set")
    .argument("<key>", "Configuration key")
    .argument("<value>", "Configuration value")
    .action(async (key, value) => {
      await configCommand.set(key, value);
    });
  program.parse();
}

main().catch(console.error);
