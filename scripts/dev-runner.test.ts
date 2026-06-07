import { describe, expect, test } from "bun:test";
import { killMatchingProcesses, parsePids } from "./dev-runner";

describe("parsePids", () => {
  test("drops empty lines, invalid values, and current pid", () => {
    expect(parsePids("10\nabc\n20\n\n30", 20)).toEqual([10, 30]);
  });
});

describe("killMatchingProcesses", () => {
  test("terminates matched pids and escalates when they survive", async () => {
    const signals: Array<[number, NodeJS.Signals | 0 | undefined]> = [];

    const killed = await killMatchingProcesses("bun --hot apps/api/src/index.ts", {
      spawn: () => ({
        stdout: new Response("11\n12\n").body,
        exited: Promise.resolve(0)
      }),
      kill: (pid, signal) => {
        signals.push([pid, signal]);
      },
      currentPid: 99,
      sleep: async () => undefined
    });

    expect(killed).toEqual([11, 12]);
    expect(signals).toEqual([
      [11, "SIGTERM"],
      [12, "SIGTERM"],
      [11, 0],
      [11, "SIGKILL"],
      [12, 0],
      [12, "SIGKILL"]
    ]);
  });

  test("returns empty when no process matches", async () => {
    const killed = await killMatchingProcesses("vite --config apps/web/vite.config.ts", {
      spawn: () => ({
        stdout: null,
        exited: Promise.resolve(1)
      }),
      kill: () => {
        throw new Error("kill should not be called");
      },
      sleep: async () => undefined
    });

    expect(killed).toEqual([]);
  });
});
