import {
  Loader2,
  Pause,
  Play,
  SkipForward,
  Square,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPythonEngine } from "@/features/workspace/engine/pythonEngine";
import { MazeGrid } from "./MazeGrid";
import { MAZE_LEVELS, type MazeLevel, type TraceFrame } from "./reeborgLevels";
import {
  buildMazeRunFiles,
  evaluateMazeCompletion,
  extractTraceFromStdout,
} from "./reeborgRuntime";

export interface ReeborgRunRequest {
  code: string;
  seq: number;
}

interface LiveReeborgPanelProps {
  runRequest: ReeborgRunRequest | null;
  levelId?: string;
  onLevelChange?: (levelId: string) => void;
  canControl?: boolean;
}

function makeInitialFrame(level: MazeLevel): TraceFrame {
  const tokens: Record<string, number> = {};
  for (const t of level.tokens) {
    if (t.count > 0) tokens[`${t.x},${t.y}`] = t.count;
  }
  return {
    x: level.start.x,
    y: level.start.y,
    dir: level.start.dir,
    tokens,
    carried: 0,
    action: "start",
  };
}

export function LiveReeborgPanel({
  runRequest,
  levelId,
  onLevelChange,
  canControl = true,
}: LiveReeborgPanelProps) {
  const [levelIdx, setLevelIdx] = useState(() => {
    if (!levelId) return 0;
    const found = MAZE_LEVELS.findIndex((l) => l.id === levelId);
    return found >= 0 ? found : 0;
  });
  const level = MAZE_LEVELS[levelIdx];

  const [engineReady, setEngineReady] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [frames, setFrames] = useState<TraceFrame[]>(() => [
    makeInitialFrame(level),
  ]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  const engineRef = useRef<ReturnType<typeof createPythonEngine> | null>(null);
  const runTimeoutRef = useRef<number | null>(null);
  const stdoutBufRef = useRef("");
  const stderrBufRef = useRef("");
  const levelRef = useRef(level);
  levelRef.current = level;

  const clearRunWatchdog = useCallback(() => {
    if (runTimeoutRef.current !== null) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
  }, []);

  const spawnEngine = useCallback(() => {
    engineRef.current?.stop();
    setEngineReady(false);

    const engine = createPythonEngine((event) => {
      if (event.type === "ready") {
        setEngineReady(true);
      } else if (event.type === "stdout") {
        stdoutBufRef.current += event.text;
      } else if (event.type === "stderr") {
        stderrBufRef.current += event.text;
      } else if (event.type === "error") {
        clearRunWatchdog();
        setIsCompiling(false);
        setIsPlaying(false);
        setRuntimeError(event.text);
      } else if (event.type === "done") {
        clearRunWatchdog();
        setIsCompiling(false);
        const { frames: parsedFrames } = extractTraceFromStdout(
          stdoutBufRef.current,
        );
        const errText = stderrBufRef.current.trim();
        if (errText && (!parsedFrames || parsedFrames.length <= 1)) {
          setRuntimeError(errText);
        }
        if (parsedFrames && parsedFrames.length > 0) {
          setFrames(parsedFrames);
          setFrameIdx(0);
          setIsPlaying(true);
        }
      }
    });

    engineRef.current = engine;
  }, [clearRunWatchdog]);

  useEffect(() => {
    spawnEngine();
    return () => {
      clearRunWatchdog();
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [clearRunWatchdog, spawnEngine]);

  const executeCode = useCallback(
    (code: string) => {
      if (!engineRef.current || !engineReady || isCompiling) return;
      stdoutBufRef.current = "";
      stderrBufRef.current = "";
      setIsPlaying(false);
      setIsCompiling(true);
      setRuntimeError(null);
      setVerdict(null);
      setFrames([makeInitialFrame(levelRef.current)]);
      setFrameIdx(0);

      clearRunWatchdog();
      runTimeoutRef.current = window.setTimeout(() => {
        setIsCompiling(false);
        setIsPlaying(false);
        setRuntimeError(
          "Infinite loop detected — execution timed out after 4s.",
        );
        spawnEngine();
      }, 4000);

      const files = buildMazeRunFiles(levelRef.current, code);
      engineRef.current.run(files, "main.py");
    },
    [clearRunWatchdog, engineReady, isCompiling, spawnEngine],
  );

  // Triggered whenever instructor clicks Run in the LiveRoom editor
  const lastSeqRef = useRef<number | null>(null);
  useEffect(() => {
    if (!runRequest || runRequest.seq === lastSeqRef.current) return;
    lastSeqRef.current = runRequest.seq;
    executeCode(runRequest.code);
  }, [executeCode, runRequest]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    if (frameIdx >= frames.length - 1) {
      setIsPlaying(false);
      const finalFrame = frames[frames.length - 1];
      if (finalFrame) {
        const result = evaluateMazeCompletion(levelRef.current, finalFrame);
        if (result.passed) {
          setVerdict({
            passed: true,
            message: `Goal reached!`,
          });
        } else if (frames.length > 1 || finalFrame.error) {
          setVerdict({
            passed: false,
            message: result.reason ?? "Goal not reached yet.",
          });
        }
      }
      return;
    }

    const delayMs = Math.max(40, Math.round(420 - speed * 3.8));
    const timer = window.setTimeout(() => {
      setFrameIdx((i) => Math.min(i + 1, frames.length - 1));
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [frameIdx, frames, isPlaying, speed]);

  const selectLevel = useCallback(
    (idx: number, notify = true) => {
      const next = MAZE_LEVELS[idx];
      setLevelIdx(idx);
      setFrames([makeInitialFrame(next)]);
      setFrameIdx(0);
      setIsPlaying(false);
      setRuntimeError(null);
      setVerdict(null);
      if (notify) onLevelChange?.(next.id);
    },
    [onLevelChange],
  );

  useEffect(() => {
    if (!levelId) return;
    const found = MAZE_LEVELS.findIndex((l) => l.id === levelId);
    if (found >= 0 && found !== levelIdx) {
      selectLevel(found, false);
    }
  }, [levelId, levelIdx, selectLevel]);

  const handleReset = () => {
    setIsPlaying(false);
    setFrames([makeInitialFrame(level)]);
    setFrameIdx(0);
    setRuntimeError(null);
    setVerdict(null);
  };

  const handleStep = () => {
    if (frames.length <= 1) return;
    setIsPlaying(false);
    setFrameIdx((i) => Math.min(i + 1, frames.length - 1));
  };

  const currentFrame = frames[frameIdx] ?? makeInitialFrame(level);
  const trail = useMemo(
    () => frames.slice(0, frameIdx + 1).map((f) => ({ x: f.x, y: f.y })),
    [frameIdx, frames],
  );
  const fuelRemaining = Math.max(0, level.fuelLimit - frameIdx);
  const fuelPercent = Math.max(
    0,
    Math.min(100, (fuelRemaining / level.fuelLimit) * 100),
  );
  const fuelColor =
    fuelPercent > 50
      ? "bg-amber-400"
      : fuelPercent > 20
        ? "bg-orange-500"
        : "bg-rose-500";
  const statusText =
    runtimeError ??
    verdict?.message ??
    (frameIdx === 0
      ? "Click Run in the editor to run Reeborg."
      : currentFrame.error
        ? currentFrame.error
        : `${currentFrame.action}()`);

  return (
    <div className="flex h-full flex-col bg-surface text-body">
      {/* Level Selector + Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="flex items-center gap-1">
          {MAZE_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              type="button"
              disabled={!canControl}
              onClick={() => selectLevel(idx)}
              title={`Mission ${lvl.number}: ${lvl.title}`}
              className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors disabled:cursor-default ${
                idx === levelIdx
                  ? "bg-accent text-on-accent"
                  : "bg-input text-muted hover:bg-hover hover:text-foreground disabled:hover:bg-input disabled:hover:text-muted"
              }`}
            >
              M{lvl.number}
            </button>
          ))}
        </div>

        {!engineReady ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Loading Python...
          </span>
        ) : isCompiling ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-accent">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Running...
          </span>
        ) : (
          <span className="text-[11px] font-medium text-muted">
            {level.title}
          </span>
        )}
      </div>

      {/* Grid Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-canvas p-3">
        <MazeGrid level={level} frame={currentFrame} trail={trail} />

        {verdict && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-canvas/75 p-3 backdrop-blur-[1px]">
            <div
              className={`flex max-w-[240px] flex-col items-center rounded-xl border bg-surface p-4 text-center shadow-lg ${
                verdict.passed
                  ? "border-emerald-500/60"
                  : currentFrame.error
                    ? "border-danger/60"
                    : "border-warning/60"
              }`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  verdict.passed
                    ? "text-success"
                    : currentFrame.error
                      ? "text-danger"
                      : "text-warning"
                }`}
              >
                {verdict.passed
                  ? "Goal reached!"
                  : currentFrame.error
                    ? "Robot crashed"
                    : "Mission failed"}
              </p>
              <p className="mt-1 text-xs text-muted">{verdict.message}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 rounded-lg border border-line bg-input px-3 py-1 text-xs font-semibold text-foreground hover:bg-hover"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls + Fuel */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={frames.length <= 1}
            title={isPlaying ? "Pause" : "Play"}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-input px-2 text-xs font-semibold text-body hover:bg-hover disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="size-3.5" aria-hidden />
            ) : (
              <Play className="size-3.5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={handleStep}
            disabled={frames.length <= 1 || frameIdx >= frames.length - 1}
            title="Step"
            className="inline-flex h-7 items-center rounded-md border border-line bg-input px-2 text-xs text-body hover:bg-hover disabled:opacity-40"
          >
            <SkipForward className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset"
            className="inline-flex h-7 items-center rounded-md border border-line bg-input px-2 text-xs text-danger hover:bg-hover"
          >
            <Square className="size-3" aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Playback speed"
            className="w-16 accent-accent"
          />
          <div className="flex min-w-[80px] max-w-[120px] flex-1 items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-muted">
              Fuel
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-input">
              <div
                className={`h-full rounded-full ${fuelColor}`}
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted">
              {fuelRemaining}
            </span>
          </div>
        </div>
      </div>

      {/* Status Strip */}
      <div className="border-t border-line bg-canvas/60 px-3 py-1.5 font-mono text-[11px] text-muted">
        <span
          className={
            runtimeError || currentFrame.error
              ? "text-danger"
              : verdict?.passed
                ? "text-success"
                : undefined
          }
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
