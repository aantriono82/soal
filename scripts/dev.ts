import { cleanupStaleProcesses } from "./dev-runner";

await cleanupStaleProcesses();

const children = [
  Bun.spawn(["bun", "run", "dev:api"], { stdout: "inherit", stderr: "inherit", stdin: "inherit" }),
  Bun.spawn(["bun", "run", "dev:web"], { stdout: "inherit", stderr: "inherit", stdin: "inherit" })
];

async function shutdown(code = 0) {
  for (const child of children) {
    child.kill("SIGTERM");
  }
  await Promise.all(children.map((child) => child.exited.catch(() => 1)));
  process.exit(code);
}

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));

const exitCode = await Promise.race(
  children.map((child) =>
    child.exited.then((code) => {
      if (code !== 0) {
        return code;
      }

      return Promise.race(children.filter((entry) => entry !== child).map((entry) => entry.exited));
    })
  )
);

await shutdown(exitCode);
