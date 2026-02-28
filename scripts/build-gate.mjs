import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const logPath = path.join(process.cwd(), ".tmp", "build-gate.stderr.log");
const nextLockPath = path.join(process.cwd(), ".next", "lock");

async function appendLog(message) {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, `${message}\n`, "utf8");
}

function isSpawnEperm(error) {
  const code = typeof error?.code === "string" ? error.code : "";
  const message = typeof error?.message === "string" ? error.message : "";
  return code === "EPERM" || message.includes("spawn EPERM");
}

async function clearNextLock() {
  try {
    await fs.rm(nextLockPath, { force: true });
  } catch {
    // Ignore lock cleanup errors; build will report a concrete failure if lock remains.
  }
}

async function runBuild(label) {
  const nextBuildModule = await import("next/dist/build/index.js");
  const nextBuild = nextBuildModule.default?.default ?? nextBuildModule.default;
  const { Bundler } = await import("next/dist/lib/bundler.js");
  await appendLog(`[${new Date().toISOString()}] ${label} | start`);

  if (typeof nextBuild !== "function") {
    throw new TypeError("next build function could not be resolved");
  }

  await nextBuild(
    process.cwd(),
    false,
    false,
    false,
    false,
    false,
    false,
    Bundler.Webpack,
  );
}

async function main() {
  const attempts = [
    { label: "default-1", env: {} },
    { label: "default-2", env: {} },
    { label: "default-3", env: {} },
    { label: "fallback-1", env: { UV_THREADPOOL_SIZE: "1" } },
    { label: "fallback-2", env: { UV_THREADPOOL_SIZE: "1" } },
    { label: "fallback-3", env: { UV_THREADPOOL_SIZE: "1" } },
  ];

  for (const attempt of attempts) {
    process.env.SKIP_NEXT_TYPECHECK = "1";
    Object.assign(process.env, attempt.env);
    await clearNextLock();
    console.log(`build-gate: ${attempt.label}`);
    try {
      await runBuild(attempt.label);
      await appendLog(`[${new Date().toISOString()}] ${attempt.label} | success`);
      return;
    } catch (error) {
      await appendLog(`[${new Date().toISOString()}] ${attempt.label} | error: ${error?.message ?? String(error)}`);
      if (!isSpawnEperm(error)) {
        throw error;
      }
      await clearNextLock();
    }
  }

  throw new Error("build-gate exhausted retries due to spawn EPERM");
}

main().catch(async (error) => {
  await appendLog(`[${new Date().toISOString()}] fatal: ${error?.stack ?? error?.message ?? String(error)}`);
  console.error(error);
  process.exit(1);
});
