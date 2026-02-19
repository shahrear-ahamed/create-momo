import path from "node:path";
import { fileURLToPath } from "node:url";
import { intro } from "@clack/prompts";
import fs from "fs-extra";
import gradient from "gradient-string";

export interface PackageInfo {
  version: string;
}

/**
 * Reads the package.json file and returns relevant metadata.
 */
export function getPkgInfo(importMetaUrl: string): PackageInfo {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = path.dirname(__filename);
  const pkgPath = path.resolve(__dirname, "../package.json");
  return fs.readJsonSync(pkgPath);
}

/**
 * Displays the Create Momo logo with a gradient.
 */
export function showLogo() {
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
}
