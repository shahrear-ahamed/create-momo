import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro } from "@clack/prompts";
import { Command } from "commander";
import fs from "fs-extra";
import gradient from "gradient-string";
import { registerConfigCommand } from "@/commands/config/config.js";
import { registerAddCommand } from "@/commands/core/add.js";
import { createProject } from "@/commands/core/create.js";
import { registerDeployCommands } from "@/commands/management/deploy.js";
import { registerProjectCommands } from "@/commands/management/project.js";
import { registerSetupCommands } from "@/commands/setup/setup.js";
import { registerUtilityCommands } from "@/commands/utility/utility.js";
import { projectUtils } from "@/utils/project.js";

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

  const logoGradient = gradient(["#00FF87", "#60EFFF", "#B2EBF2", "#F0F9FF"]).multiline(logo);
  intro(logoGradient);

  program
    .name("momo")
    .description("A modern CLI tool for managing monorepo projects")
    .version(pkg.version, "-v, --version")
    .helpOption("-h, --help", "Show help");

  registerAddCommand(program);
  registerConfigCommand(program);
  registerSetupCommands(program);
  registerDeployCommands(program);
  registerUtilityCommands(program);
  registerProjectCommands(program);

  // Smart default: no args → check context
  if (process.argv.length <= 2) {
    if (projectUtils.isInsideProject()) {
      program.help();
    } else {
      await createProject({ version: pkg.version });
    }
    return;
  }

  program.parse();
}

main().catch(console.error);
