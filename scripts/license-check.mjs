import fs from "node:fs/promises";
import path from "node:path";

const BLOCKED_LICENSE_PATTERNS = [
  /\bAGPL(?:-|\s|$)/i,
  /\bGPL(?:-|\s|$)/i,
];

function isBlockedLicense(licenseValue) {
  if (!licenseValue || typeof licenseValue !== "string") return false;
  return BLOCKED_LICENSE_PATTERNS.some((pattern) => pattern.test(licenseValue));
}

async function readPackageLicense(packageJsonPath) {
  const content = await fs.readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(content);
  return typeof parsed.license === "string" ? parsed.license : null;
}

async function collectProductionPackageJsons(nodeModulesPath) {
  const packageJsons = new Set();
  const rootEntries = await fs.readdir(nodeModulesPath, { withFileTypes: true });

  for (const entry of rootEntries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === ".bin") continue;

    if (entry.name.startsWith("@")) {
      const scopePath = path.join(nodeModulesPath, entry.name);
      const scopedEntries = await fs.readdir(scopePath, { withFileTypes: true });
      for (const scopedEntry of scopedEntries) {
        if (!scopedEntry.isDirectory()) continue;
        packageJsons.add(path.join(scopePath, scopedEntry.name, "package.json"));
      }
      continue;
    }

    packageJsons.add(path.join(nodeModulesPath, entry.name, "package.json"));
  }

  return packageJsons;
}

async function run() {
  const nodeModulesPath = path.resolve(process.cwd(), "node_modules");
  const packageJsons = await collectProductionPackageJsons(nodeModulesPath);
  const violations = [];

  for (const packageJsonPath of packageJsons) {
    try {
      const license = await readPackageLicense(packageJsonPath);
      if (isBlockedLicense(license)) {
        violations.push({
          packageJsonPath,
          license,
        });
      }
    } catch {
      // Ignore missing/invalid package metadata files.
    }
  }

  if (violations.length > 0) {
    console.error("Blocked licenses detected (GPL/AGPL):");
    for (const violation of violations) {
      console.error(`- ${violation.license}: ${violation.packageJsonPath}`);
    }
    process.exit(1);
  }

  console.log("License policy check passed: no GPL/AGPL packages detected in node_modules.");
}

run().catch((error) => {
  console.error("License check failed unexpectedly:", error);
  process.exit(1);
});
