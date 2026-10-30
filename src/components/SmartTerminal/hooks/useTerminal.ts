import { useEffect, useRef, useState } from "react";
import type { TerminalLine } from "../TerminalView";
import { commands } from "../utils/terminalCommands";
import { completeInput } from "../utils/autoTerminalComplete";
import { FileManagement, type FsNode } from "@/features/workspace/utils/File";
import { createPythonEngine } from "@/features/workspace/engine/pythonEngine";
import { collectFiles } from "@/features/workspace/utils/exportProject";

export function useTerminal(
  nodes: FsNode[],
  setNodes: React.Dispatch<React.SetStateAction<FsNode[]>>,
) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: "system", text: "Python 3.12 ready" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [pointer, setPointer] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const engineRef = useRef<ReturnType<typeof createPythonEngine> | null>(null);
  const pendingRef = useRef<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const nodesRef = useRef(nodes);

  nodesRef.current = nodes;

  const push = (line: TerminalLine) => setLines((prev) => [...prev, line]);

  // apply files created or changed by Python back into the Explorer tree
  const applyChanges = (
    changes?: { path: string; content: string }[],
    deleted?: string[],
  ) => {
    if (!changes?.length && !deleted?.length) return;

    setNodes((prev) => {
      let next = (changes ?? []).reduce(
        (acc, f) => FileManagement.upsertByPath(acc, f.path, f.content),
        prev,
      );
      next = (deleted ?? []).reduce(
        (acc, p) => FileManagement.removeByPath(acc, p),
        next,
      );
      return next;
    });
  };

  const submit = () => {
    if (prompt !== null) {
      push({ kind: "stdout", text: prompt + input });
      engineRef.current?.sendInput(input);
      setPrompt(null);
      setInput("");
      return;
    }

    const text = input.trim();
    setInput("");
    if (!text) return;

    setHistory((prev) =>
      prev[prev.length - 1] === text ? prev : [...prev, text],
    );
    setPointer(history.length + 1);

    const [name, ...args] = text.split(/\s+/);
    const echo: TerminalLine = { kind: "command", text };
    const command = commands[name];

    if (!command) {
      setLines((prev) => [
        ...prev,
        echo,
        { kind: "stderr", text: `${name}: command not found` },
      ]);
      return;
    }

    const result = command(args, nodes);
    if (result.clear) return setLines([]);

    if (result.run) {
      setLines((prev) => [...prev, echo]);
      runCode(result.run.path);
      return;
    }

    setLines((prev) => [...prev, echo, ...(result.lines ?? [])]);
  };

  const navigate = (direction: "up" | "down") => {
    if (history.length === 0) return;
    const next = Math.min(
      history.length,
      Math.max(0, pointer + (direction === "up" ? -1 : 1)),
    );
    setPointer(next);
    setInput(next === history.length ? "" : history[next]);
  };

  const startEngine = () => {
    setReady(false);
    engineRef.current = createPythonEngine((event) => {
      switch (event.type) {
        case "ready":
          setReady(true);
          if (pendingRef.current !== null) {
            engineRef.current?.run(
              collectFiles(nodesRef.current),
              pendingRef.current,
            );
            pendingRef.current = null;
          }
          break;
        case "stdout":
          push({ kind: "stdout", text: event.text });
          break;
        case "input-request":
          setPrompt(event.prompt);
          break;
        case "error":
          push({ kind: "stderr", text: event.text });
          setPrompt(null);
          setIsRunning(false);
          break;
        case "done":
          applyChanges(event.changes, event.deleted);
          setPrompt(null);
          setIsRunning(false);
          break;
      }
    });
  };

  useEffect(() => {
    startEngine();
    return () => engineRef.current?.stop();
  }, []);

  const runCode = (path: string) => {
    if (isRunning)
      return push({ kind: "stderr", text: "A program is already running." });
    setIsRunning(true);
    if (ready) {
      engineRef.current?.run(collectFiles(nodesRef.current), path);
    } else {
      pendingRef.current = path;
      push({ kind: "system", text: "Loading Python runtime..." });
    }
  };

  const runFile = (path: string | null) => {
    if (!path) return push({ kind: "stderr", text: "No file open to run." });
    if (!path.endsWith(".py"))
      return push({ kind: "stderr", text: `Only .py files can run: ${path}` });
    push({ kind: "command", text: `python ${path}` });
    runCode(path);
  };

  const stop = () => {
    engineRef.current?.stop(); // kills the worker
    pendingRef.current = null;
    setIsRunning(false);
    push({ kind: "system", text: "Process terminated" });
    startEngine(); // fresh worker for the next run
  };

  const complete = () => {
    if (prompt !== null) return; // Python is asking for input, no completion
    const result = completeInput(input, nodes);
    if (result.options.length) {
      setLines((prev) => [
        ...prev,
        { kind: "command", text: input },
        { kind: "stdout", text: result.options.join("  ") },
      ]);
    }
    setInput(result.input);
  };

  const clear = () => setLines([]);

  return {
    lines,
    input,
    setInput,
    submit,
    navigate,
    isRunning,
    stop,
    prompt,
    runFile,
    complete,
    clear,
    ready,
  };
}
