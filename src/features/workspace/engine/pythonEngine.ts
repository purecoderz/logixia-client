export type EngineEvent =
  | { type: "ready" }
  | { type: "stdout"; text: string }
  | { type: "stderr"; text: string }
  | {
      type: "done";
      changes?: { path: string; content: string }[];
      deleted?: string[];
    }
  | { type: "input-request"; prompt: string }
  | { type: "error"; text: string };

export function createPythonEngine(onEvent: (event: EngineEvent) => void) {
  if (typeof SharedArrayBuffer === "undefined") {
    queueMicrotask(() =>
      onEvent({
        type: "error",
        text: "Python runtime unavailable: SharedArrayBuffer requires Cross-Origin Isolation headers.",
      }),
    );
    return {
      run() {},
      stop() {},
      sendInput() {},
    };
  }

  const worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), {
    type: "module",
  });

  const sab = new SharedArrayBuffer(4 + 1024); // 4 bytes flag + 1KB text

  worker.onmessage = (e: MessageEvent<EngineEvent>) => onEvent(e.data);
  worker.onerror = (e: ErrorEvent) =>
    onEvent({
      type: "error",
      text: `Python worker error: ${e.message || "Failed to start worker."}`,
    });
  worker.postMessage({ type: "init", sab });

  return {
    run(files: { path: string; content: string }[], entry: string) {
      worker.postMessage({ type: "run", files, entry });
    },
    stop() {
      worker.terminate();
    },
    sendInput(text: string) {
      const bytes = new TextEncoder().encode(text).slice(0, sab.byteLength - 4);
      new Uint8Array(sab, 4).set(bytes);

      const flag = new Int32Array(sab, 0, 1);
      Atomics.store(flag, 0, bytes.length + 1); // answer ready
      Atomics.notify(flag, 0); // wake the worker
    },
  };
}
