import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro } from "@clack/prompts";
import { Command } from "commander";
import fs from "fs-extra";
import gradient from "gradient-string";
import { registerConfigCommand } from "@/commands/config/config.js";
import { registerAddCommand } from "@/commands/core/add.js";
import { registerCreateCommand } from "@/commands/core/create.js";
import { registerDeployCommands } from "@/commands/management/deploy.js";
import { registerProjectCommands } from "@/commands/management/project.js";
import { registerSetupCommands } from "@/commands/setup/setup.js";
import { registerUtilityCommands } from "@/commands/utility/utility.js";

// Read package.json dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = fs.readJsonSync(pkgPath);

const program = new Command();

async function main() {
  console.clear();

  const logo = `
 ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗    ███╗   ███╗ ██████╗ ███╗   ███╗ ██████╗ 
██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝    ████╗ ████║██╔═══██╗████╗ ████║██╔═══██╗
██║     ██████╔╝█████╗  ███████║   ██║   █████╗      ██╔████╔██║██║   ██║██╔████╔██║██║   ██║
██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝      ██║╚██╔╝██║██║   ██║██║╚██╔╝██║██║   ██║
╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗    ██║ ╚═╝ ██║╚██████╔╝██║ ╚═╝ ██║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ 
                             
    `;

  const logoGradient = gradient([
    "#00FF87",
    "#60EFFF",
    "#B2EBF2",
    "#F0F9FF",
  ]).multiline(logo);
  intro(logoGradient);

  program
    .name("create-momo")
    .description(
      "A modern CLI tool for creating and managing monorepo projects",
    )
    .version(pkg.version, "-v, --version")
    .helpOption("-h, --help", "Show help");

  // --- REGISTER COMMANDS ---
  registerCreateCommand(program, pkg.version);
  registerAddCommand(program);
  registerConfigCommand(program);
  registerSetupCommands(program);
  registerDeployCommands(program);
  registerUtilityCommands(program);
  registerProjectCommands(program);

  program.parse();
}

main().catch(console.error);
