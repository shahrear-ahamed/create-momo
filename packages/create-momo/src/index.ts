import { intro } from "@clack/prompts";
import { Command } from "commander";
import color from "picocolors";
import { addComponent } from "@/commands/add.js";
import { configCommand } from "@/commands/config.js";
import { setupCommand } from "@/commands/setup.js";

const program = new Command();

async function main() {
  console.clear();

  intro(color.bgCyan(color.black(" MOMO ")));

  program
    .name("create-momo")
    .description(
      "A modern CLI tool for creating and managing monorepo projects",
    )
    .version("0.0.0");

  // Root command (create project)
  program
    .argument("[project-name]", "Name of the project directory")
    .action(async (projectName) => {
      // Only run if no subcommand is matched
      if (projectName) {
        console.log(`Creating project in: ${projectName}`);
      } else {
        console.log("Interactive project creation wizard...");
      }
      // Implementation coming in Phase 2
    });

  // Add command
  program
    .command("add")
    .description("Add apps, packages, or configurations to existing project")
    .option("-a, --app", "Add an application")
    .option("-p, --package", "Add a package")
    .action(async (type, options) => {
      await addComponent(type, options);
    });

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
