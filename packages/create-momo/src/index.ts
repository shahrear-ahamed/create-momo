import { intro } from "@clack/prompts";
import { Command } from "commander";
import color from "picocolors";

// import packageJson from '../package.json'; // We'll handle version properly later

const program = new Command();

async function main() {
  console.clear();

  intro(color.bgCyan(color.black(" MOMO ")));

  program
    .name("create-momo")
    // .version(packageJson.version)
    .description(
      "A modern CLI tool for creating and managing Turborepo monorepo projects",
    );

  program
    .command("create")
    .argument("[name]", "Name of the project")
    .description("Create a new monorepo project")
    .action((name) => {
      console.log(`Creating project: ${name}`);
      // Implementation coming in Phase 2
    });

  program.parse();
}

main().catch(console.error);
