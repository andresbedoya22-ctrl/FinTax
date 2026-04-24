import { execSync } from "node:child_process";

execSync("pnpm exec vitest run tests/toeslagen/legacy-eligibility-wrapper.test.tsx", {
  stdio: "inherit",
});
