const STALE_PROCESS_PATTERNS = [
  "bun --hot apps/api/src/index.ts",
  "vite --config apps/web/vite.config.ts --host 0.0.0.0 --port 3000"
];

type SpawnResult = {
  stdout?: ReadableStream | null;
  exited: Promise<number>;
};

type SpawnFn = (cmd: string[], options: { stdout: "pipe"; stderr: "ignore" }) => SpawnResult;
type KillFn = (pid: number, signal?: NodeJS.Signals | 0) => void;

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function unique(values: number[]) {
  return [...new Set(values)];
}

function ignoreProcessError() {
  return undefined;
}

export function parsePids(output: string, currentPid = process.pid) {
  return output
    .split("\n")
    .map((line) => Number(line.trim()))
    .filter((value) => Number.isInteger(value) && value > 0 && value !== currentPid);
}

export async function killMatchingProcesses(
  pattern: string,
  {
    spawn = Bun.spawn,
    kill = process.kill,
    currentPid = process.pid,
    sleep = delay
  }: {
    spawn?: SpawnFn;
    kill?: KillFn;
    currentPid?: number;
    sleep?: typeof delay;
  } = {}
) {
  const proc = spawn(["pgrep", "-f", pattern], {
    stdout: "pipe",
    stderr: "ignore"
  });

  const exited = await proc.exited;
  if (exited !== 0) {
    return [];
  }

  const output = await new Response(proc.stdout).text();
  const pids = unique(parsePids(output, currentPid));
  if (pids.length === 0) {
    return [];
  }

  for (const pid of pids) {
    try {
      kill(pid, "SIGTERM");
    } catch {
      ignoreProcessError();
    }
  }

  await sleep(300);

  for (const pid of pids) {
    try {
      kill(pid, 0);
      kill(pid, "SIGKILL");
    } catch {
      ignoreProcessError();
    }
  }

  return pids;
}

export async function cleanupStaleProcesses() {
  for (const pattern of STALE_PROCESS_PATTERNS) {
    await killMatchingProcesses(pattern);
  }
}

export { STALE_PROCESS_PATTERNS };
