import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro } from "@clack/prompts";
import { Command } from "commander";
import fs from "fs-extra";
import color from "picocolors";
import { addComponent } from "@/commands/add.js";
import { configCommand } from "@/commands/config.js";
import { deployCommand } from "@/commands/deploy.js";
import { setupCommand } from "@/commands/setup.js";
import { utilityCommand } from "@/commands/utility.js";
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
    .version(pkg.version, "-v, --version")
    .helpOption("-h, --help", "Show help")
    .addHelpText(
      "before",
      `
${color.bold("Core")}
  create <name>              ${color.dim("# Create new monorepo")}
  add -a/--app               ${color.dim("# Add app (categorized)")}
  add -p/--package           ${color.dim("# Add package (categorized)")}
  config <subcommand>         ${color.dim("# Manage configuration")}

${color.bold("Setup")}
  setup project              ${color.dim("# Select pre-configured blueprint")}
  setup publish              ${color.dim("# Configure npm publishing")}
  setup open-source          ${color.dim("# Add open-source files")}
  setup close-source         ${color.dim("# Add proprietary files")}

${color.bold("Deploy")}
  deploy init                ${color.dim("# Initialize deployment config")}
  deploy push                ${color.dim("# Deploy to platform")}

${color.bold("Utility")}
  list                       ${color.dim("# List templates")}
  doctor                     ${color.dim("# Check project health")}
  update                     ${color.dim("# Update configs")}
  --version/-v               ${color.dim("# Show version")}
  --help/-h                  ${color.dim("# Show help")}
`,
    );

  // --- CORE COMMANDS ---
  program
    .command("create")
    .description("Create a new monorepo project")
    .argument("[project-name]", "Name of the project directory")
    .action(async (projectName) => await createProject({ name: projectName }));

  program
    .command("add")
    .description("Add apps, packages, or configurations to existing project")
    .option("-a, --app", "Add an application (categorized)")
    .option("-p, --package", "Add a package (categorized)")
    .action(async (type, options) => await addComponent(type, options));

  const config = program.command("config").description("Manage configuration");
  config
    .command("list")
    .description("List all configurations")
    .action(async () => await configCommand.list());
  config
    .command("get")
    .argument("<key>", "Configuration key")
    .action(async (key) => await configCommand.get(key));
  config
    .command("set")
    .argument("<key>", "Configuration key")
    .argument("<value>", "Configuration value")
    .action(async (key, value) => await configCommand.set(key, value));

  // --- SETUP COMMANDS ---
  const setup = program
    .command("setup")
    .description("Setup configurations and project types");

  setup
    .command("project")
    .description("Select pre-configured blueprint")
    .action(async () => await setupCommand.project());

  setup
    .command("publish")
    .description("Configure npm publishing")
    .action(async () => await setupCommand.publish());

  setup
    .command("open-source")
    .description("Add open-source files (LICENSE, CONTRIBUTING, etc.)")
    .action(async () => await setupCommand.openSource());

  setup
    .command("close-source")
    .description("Configure for proprietary use")
    .action(async () => await setupCommand.closeSource());

  // --- DEPLOY COMMANDS ---
  const deploy = program.command("deploy").description("Deployment workflows");
  deploy
    .command("init")
    .description("Initialize deployment config")
    .action(async () => await deployCommand.init());
  deploy
    .command("push")
    .description("Deploy to platform")
    .action(async () => await deployCommand.push());

  // --- UTILITY COMMANDS ---
  program
    .command("list")
    .description("List available component flavors")
    .action(async () => await utilityCommand.list());

  program
    .command("doctor")
    .description("Check project health")
    .action(async () => await utilityCommand.doctor());

  program
    .command("update")
    .description("Update configurations")
    .action(async () => await utilityCommand.update());

  // Support implicit create (root argument)
  program
    .argument("[project-name]", "Name of the project directory")
    .action(async (projectName) => {
      if (!projectName) {
        program.help();
        return;
      }
      await createProject({ name: projectName });
    });

  program.parse();
}

main().catch(console.error);
