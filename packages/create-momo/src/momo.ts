import { registerConfigCommand } from "@/commands/config/config.js";
import { registerAddCommand } from "@/commands/core/add.js";
import { createProject } from "@/commands/core/create.js";
import { registerInstallCommand } from "@/commands/core/install.js";
import { registerRunCommand } from "@/commands/core/run.js";
import { registerDeployCommands } from "@/commands/management/deploy.js";
import { registerProjectCommands } from "@/commands/management/project.js";
import { registerRemoteCacheCommands } from "@/commands/management/remote-cache.js";
import { registerSetupCommands } from "@/commands/setup/setup.js";
import { registerUtilityCommands } from "@/commands/utility/utility.js";
import { getPkgInfo } from "@/utils/cli-utils.js";
import { projectUtils } from "@/utils/project.js";
import { Command } from "commander";

const pkg = getPkgInfo(import.meta.url);
const program = new Command();

async function main() {
  program
    .name("momo")
    .description("A modern CLI tool for managing monorepo projects")
    .version(pkg.version, "-v, --version")
    .helpOption("-h, --help", "Show help");

  // ─── Management ────────────────────────────────────────────────────────────
  registerAddCommand(program);
  registerInstallCommand(program);

  // ─── Orchestration ─────────────────────────────────────────────────────────
  registerSetupCommands(program);
  registerConfigCommand(program);
  registerUtilityCommands(program); // list, doctor

  // ─── Execution & Infra ─────────────────────────────────────────────────────
  registerRunCommand(program);
  registerDeployCommands(program);
  registerRemoteCacheCommands(program);
  registerProjectCommands(program); // project specific management

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
