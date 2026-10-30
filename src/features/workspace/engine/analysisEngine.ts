export type Problem = { line: number; col: number; message: string };
export type HoverInfo = { name: string; type: string; doc: string };

export function createAnalysisEngine() {
  const worker = new Worker(new URL("./analysis.worker.ts", import.meta.url), {
    type: "module",
  });

  let nextId = 0;
  const pending = new Map<number, (value: any) => void>();

  const ready = new Promise<void>((resolve) => {
    worker.onmessage = (e) => {
      if (e.data.type === "ready") resolve();

      if (e.data.type === "lint-result") {
        pending.get(e.data.id)?.(e.data.problems);
        pending.delete(e.data.id);
      }

      if (e.data.type === "hover-result") {
        pending.get(e.data.id)?.(e.data.info);
        pending.delete(e.data.id);
      }

      if (e.data.type === "complete-result") {
        pending.get(e.data.id)?.(e.data.items);
        pending.delete(e.data.id);
      }
    };
  });

  return {
    ready,
    async lint(code: string) {
      await ready;
      return new Promise<Problem[]>((resolve) => {
        const id = nextId++;
        pending.set(id, resolve);
        worker.postMessage({ type: "lint", id, code });
      });
    },

    async complete(code: string, line: number, col: number) {
      await ready;
      return new Promise<CompletionItem[]>((resolve) => {
        const id = nextId++;
        pending.set(id, resolve);
        worker.postMessage({ type: "complete", id, code, line, col });
      });
    },
    
    async hover(code: string, line: number, col: number) {
      await ready;
      return new Promise<HoverInfo | null>((resolve) => {
        const id = nextId++;
        pending.set(id, resolve);
        worker.postMessage({ type: "hover", id, code, line, col });
      });
    },
    stop() {
      worker.terminate();
    },
  };
}

let shared: ReturnType<typeof createAnalysisEngine> | null = null;

export function getAnalysisEngine() {
  if (!shared) shared = createAnalysisEngine();
  return shared;
}

export type CompletionItem = { name: string; type: string };
