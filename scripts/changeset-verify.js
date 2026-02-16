import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import readline from "node:readline";

/**
 * This script checks if any package files have been modified
 * and prompts the user to create a changeset if one is missing.
 */

async function verifyChangeset() {
  // 1. Get the current branch
  const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8",
  }).stdout.trim();

  // Don't enforce on main
  if (branch === "main") return;

  // 2. Check for changes in packages compared to main
  const diffFiles = spawnSync("git", ["diff", "--name-only", "main...HEAD"], {
    encoding: "utf8",
  }).stdout.split("\n");

  const hasPackageChanges = diffFiles.some((file) => file.startsWith("packages/"));

  if (!hasPackageChanges) {
    console.log("✅ No changes detected in packages. Skipping changeset check.");
    return;
  }

  // 3. Check for existing changesets (excluding README.md and config.json)
  const changesetDir = ".changeset";
  const existingChangesets = existsSync(changesetDir)
    ? readdirSync(changesetDir).filter((f) => f.endsWith(".md") && f !== "README.md")
    : [];

  if (existingChangesets.length > 0) {
    console.log("✅ Changeset found. Ready to push.");
    return;
  }

  // 4. Prompt the user
  console.log("\n⚠️  You have modified packages but NO changeset was found.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise((resolve) => {
    rl.question("Would you like to generate a changeset now? (y/n): ", (ans) => {
      rl.close();
      resolve(ans.toLowerCase());
    });
  });

  if (answer === "y" || answer === "yes") {
    console.log("Running 'pnpm changeset'...");
    spawnSync("pnpm", ["changeset"], { stdio: "inherit" });

    console.log("\n✅ Changeset created! Please commit it before pushing.");
    process.exit(1); // Block the push so they can commit the changeset
  } else {
    console.log("⏩ Skipping changeset. Continuing with push...");
  }
}

verifyChangeset().catch((err) => {
  console.error("Error in changeset verification:", err);
  process.exit(1);
});
