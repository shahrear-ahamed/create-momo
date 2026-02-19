import { Command } from "commander";
import { registerConfigCommand } from "@/commands/config/config.js";
import { registerAddCommand } from "@/commands/core/add.js";
import { createProject } from "@/commands/core/create.js";
import { registerDeployCommands } from "@/commands/management/deploy.js";
import { registerProjectCommands } from "@/commands/management/project.js";
import { registerRemoteCacheCommands } from "@/commands/management/remote-cache.js";
import { registerTurboUtils } from "@/commands/management/turbo-utils.js";
import { registerSetupCommands } from "@/commands/setup/setup.js";
import { registerUtilityCommands } from "@/commands/utility/utility.js";
import { getPkgInfo, showLogo } from "@/utils/cli-utils.js";
import { projectUtils } from "@/utils/project.js";

const pkg = getPkgInfo(import.meta.url);
const program = new Command();

async function main() {
  console.clear();
  showLogo();

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
  registerRemoteCacheCommands(program);
  registerTurboUtils(program);

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
