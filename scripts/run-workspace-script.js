const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const scriptName = process.argv[2];
const workspaces = ["server", "client"];
let ranScript = false;

if (!scriptName) {
  console.error("Missing workspace script name.");
  process.exit(1);
}

for (const workspace of workspaces) {
  const manifestPath = join(process.cwd(), workspace, "package.json");

  if (!existsSync(manifestPath)) {
    continue;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (!manifest.scripts || !manifest.scripts[scriptName]) {
    continue;
  }

  ranScript = true;

  const result = spawnSync(
    "npm",
    ["run", scriptName, "--workspace", workspace],
    { stdio: "inherit", shell: process.platform === "win32" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!ranScript) {
  console.log(`No workspace defines "${scriptName}" yet.`);
}
