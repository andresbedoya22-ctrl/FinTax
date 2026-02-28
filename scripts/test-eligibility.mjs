import { execSync } from "node:child_process";
import fs from "node:fs";

const outDir = ".tmp-test-build";
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

execSync(`pnpm exec tsc --module commonjs --target es2020 --skipLibCheck --esModuleInterop --moduleResolution node --outDir ${outDir} src/lib/constants/toeslagen-rules.ts src/lib/utils/eligibility-calculator.ts`, { stdio: "inherit" });
execSync("node -e \"require('node:test'); require('./tests/eligibility-calculator.test.cjs')\"", {
  stdio: "inherit",
});
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}

