import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Square,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/features/theme/ThemeProvider";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { createPythonEngine } from "@/features/workspace/engine/pythonEngine";
import { MazeGrid } from "./MazeGrid";
import { MAZE_LEVELS, type MazeLevel, type TraceFrame } from "./reeborgLevels";
import {
  buildMazeRunFiles,
  evaluateMazeCompletion,
  extractTraceFromStdout,
} from "./reeborgRuntime";

const baseEditorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "14px" },
  ".cm-scroller": { overflow: "auto", height: "100%" },
  ".cm-content": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    padding: "12px 0",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 8px" },
  "&.cm-editor.cm-focused": { outline: "none" },
});

const COMPLETED_STORAGE_KEY = "logixia:bot-maze-completed";
const CODE_STORAGE_KEY = "logixia:bot-maze-code";

const REEBORG_COMMANDS = [
  { name: "move()", desc: "Move forward 1 cell" },
  { name: "turn_left()", desc: "Rotate 90° left" },
  { name: "take()", desc: "Pick up a token here" },
  { name: "put()", desc: "Drop a carried token" },
  { name: "front_is_clear()", desc: "True if no wall ahead" },
  { name: "right_is_clear()", desc: "True if no wall on right" },
  { name: "wall_in_front()", desc: "True if wall ahead" },
  { name: "wall_on_right()", desc: "True if wall on right" },
  { name: "at_goal()", desc: "True when on goal flag" },
  { name: "object_here()", desc: "True if token on cell" },
  { name: "carries_object()", desc: "True if holding token(s)" },
  { name: "is_facing_north()", desc: "True when facing North" },
];

function loadCompletedLevels(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadSavedCodeByLevel(): Record<string, string> {
  const defaults = Object.fromEntries(
    MAZE_LEVELS.map((l) => [l.id, l.starterCode]),
  );
  try {
    const raw = localStorage.getItem(CODE_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...defaults, ...parsed };
    }
  } catch {
    // Ignore storage parse errors
  }
  return defaults;
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

export function getBotMazeCompletedIds(): string[] {
  return loadCompletedLevels();
}

export function getBotMazeTotalXp(): number {
  const completed = new Set(loadCompletedLevels());
  return MAZE_LEVELS.reduce(
    (sum, lvl) => (completed.has(lvl.id) ? sum + lvl.xp : sum),
    0,
  );
}

export function CodeBotMazeView({
  onBack,
  initialLevelId,
}: {
  onBack: () => void;
  initialLevelId?: string;
}) {
  const [levelIdx, setLevelIdx] = useState(() => {
    if (!initialLevelId) return 0;
    const found = MAZE_LEVELS.findIndex((l) => l.id === initialLevelId);
    return found >= 0 ? found : 0;
  });
  const level = MAZE_LEVELS[levelIdx];

  const [codeByLevel, setCodeByLevel] = useState<Record<string, string>>(
    loadSavedCodeByLevel,
  );
  const code = codeByLevel[level.id] ?? level.starterCode;

  const updateLevelCode = useCallback(
    (nextCode: string) => {
      setCodeByLevel((prev) => {
        const updated = { ...prev, [level.id]: nextCode };
        try {
          localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore storage quota errors
        }
        return updated;
      });
    },
    [level.id],
  );

  const [completedIds, setCompletedIds] = useState<string[]>(loadCompletedLevels);
  const [showDocs, setShowDocs] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [engineReady, setEngineReady] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [frames, setFrames] = useState<TraceFrame[]>(() => [
    makeInitialFrame(level),
  ]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [consoleOut, setConsoleOut] = useState("");
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
  const playAfterRunRef = useRef(true);

  const clearRunWatchdog = useCallback(() => {
    if (runTimeoutRef.current !== null) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
  }, []);

  const { theme } = useTheme();
  const editorExtensions = useMemo(() => [python(), baseEditorTheme], []);

  const markLevelCompleted = useCallback((lvlId: string) => {
    setCompletedIds((prev) => {
      if (prev.includes(lvlId)) return prev;
      const next = [...prev, lvlId];
      try {
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
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
        const { frames: parsedFrames, cleanStdout } = extractTraceFromStdout(
          stdoutBufRef.current,
        );
        const errText = stderrBufRef.current.trim();
        setConsoleOut(
          [cleanStdout, errText].filter(Boolean).join("\n").trim(),
        );

        if (errText && (!parsedFrames || parsedFrames.length <= 1)) {
          setRuntimeError(errText);
        }

        if (parsedFrames && parsedFrames.length > 0) {
          setFrames(parsedFrames);
          setFrameIdx(0);
          setIsPlaying(playAfterRunRef.current);
          if (!playAfterRunRef.current && parsedFrames.length > 1) {
            setFrameIdx(1);
          }
        }
      }
    });

    engineRef.current = engine;
  }, [clearRunWatchdog]);

  // Initialize Pyodide worker once for the maze view
  useEffect(() => {
    spawnEngine();
    return () => {
      clearRunWatchdog();
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [clearRunWatchdog, spawnEngine]);

  // Reset board when switching levels
  const selectLevel = (idx: number) => {
    const next = MAZE_LEVELS[idx];
    setLevelIdx(idx);
    setFrames([makeInitialFrame(next)]);
    setFrameIdx(0);
    setIsPlaying(false);
    setConsoleOut("");
    setRuntimeError(null);
    setVerdict(null);
    setShowHint(false);
  };

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    if (frameIdx >= frames.length - 1) {
      setIsPlaying(false);
      const finalFrame = frames[frames.length - 1];
      if (finalFrame) {
        const result = evaluateMazeCompletion(levelRef.current, finalFrame);
        if (result.passed) {
          markLevelCompleted(levelRef.current.id);
          setVerdict({
            passed: true,
            message: `Level Complete! +${levelRef.current.xp} XP earned.`,
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
  }, [frameIdx, frames, isPlaying, markLevelCompleted, speed]);

  const runCode = (autoPlay: boolean) => {
    if (!engineRef.current || !engineReady || isCompiling) return;
    stdoutBufRef.current = "";
    stderrBufRef.current = "";
    playAfterRunRef.current = autoPlay;
    setIsPlaying(false);
    setIsCompiling(true);
    setConsoleOut("");
    setRuntimeError(null);
    setVerdict(null);
    setFrames([makeInitialFrame(level)]);
    setFrameIdx(0);

    clearRunWatchdog();
    runTimeoutRef.current = window.setTimeout(() => {
      setIsCompiling(false);
      setIsPlaying(false);
      setRuntimeError("Infinite loop detected — execution timed out after 4s.");
      spawnEngine();
    }, 4000);

    const files = buildMazeRunFiles(level, code);
    engineRef.current.run(files, "main.py");
  };

  const handleStep = () => {
    if (frames.length <= 1) {
      runCode(false);
      return;
    }
    setIsPlaying(false);
    setFrameIdx((i) => {
      const next = Math.min(i + 1, frames.length - 1);
      if (next === frames.length - 1) {
        const result = evaluateMazeCompletion(level, frames[next]);
        setVerdict({
          passed: result.passed,
          message: result.passed
            ? `Level Complete! +${level.xp} XP earned.`
            : result.reason ?? "Goal not reached yet.",
        });
        if (result.passed) markLevelCompleted(level.id);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setFrames([makeInitialFrame(level)]);
    setFrameIdx(0);
    setRuntimeError(null);
    setVerdict(null);
  };

  const insertCommand = (cmd: string) => {
    updateLevelCode(`${code.trimEnd()}\n${cmd}`);
  };

  const currentFrame = frames[frameIdx] ?? makeInitialFrame(level);
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
      ? "Ready. Press Run or Step to begin."
      : currentFrame.error
        ? currentFrame.error
        : `${currentFrame.action}()`);
  const trail = useMemo(
    () => frames.slice(0, frameIdx + 1).map((f) => ({ x: f.x, y: f.y })),
    [frameIdx, frames],
  );
  const totalXp = useMemo(
    () =>
      MAZE_LEVELS.reduce(
        (sum, l) => (completedIds.includes(l.id) ? sum + l.xp : sum),
        0,
      ),
    [completedIds],
  );
  const hasNextLevel = levelIdx < MAZE_LEVELS.length - 1;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-canvas text-body">
      {/* Full-Screen Arcade Top Bar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-input px-3 text-xs font-semibold text-body transition-colors hover:bg-hover hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Missions
          </button>

          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
              M{level.number}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                  {level.title}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-warning">
                  <Sparkles className="size-3" aria-hidden />+{level.xp} XP
                </span>
              </div>
              <p className="hidden text-xs text-muted sm:block">
                {level.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Mission Switcher + Hint + Commands + XP + Theme Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-1 rounded-lg border border-line bg-input p-1 md:flex">
            {MAZE_LEVELS.map((lvl, idx) => {
              const active = idx === levelIdx;
              const done = completedIds.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => selectLevel(idx)}
                  title={`Mission ${lvl.number}: ${lvl.title}`}
                  className={`inline-flex h-7 items-center gap-1 rounded-md px-2.5 font-mono text-xs font-semibold transition-colors ${
                    active
                      ? "bg-accent text-on-accent"
                      : done
                        ? "bg-emerald-500/15 text-success hover:bg-emerald-500/25"
                        : "text-muted hover:bg-hover hover:text-foreground"
                  }`}
                >
                  <span>M{lvl.number}</span>
                  {done && !active && (
                    <CheckCircle2 className="size-3" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
              showHint
                ? "border-amber-500/40 bg-amber-500/15 text-warning"
                : "border-line bg-input text-body hover:bg-hover hover:text-foreground"
            }`}
          >
            <Lightbulb className="size-3.5 text-warning" aria-hidden />
            Hint
          </button>

          <button
            type="button"
            onClick={() => setShowDocs((d) => !d)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
              showDocs
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-line bg-input text-body hover:bg-hover hover:text-foreground"
            }`}
          >
            <BookOpen className="size-3.5" aria-hidden />
            Commands
          </button>

          <div className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-input px-3 font-mono text-xs font-bold text-foreground">
            <Zap className="size-3.5 text-warning" aria-hidden />
            <span>{totalXp} XP</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Full-Height Split Arena */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left: World Arena */}
        <section className="flex min-h-0 flex-1 basis-0 flex-col border-b border-line lg:border-b-0 lg:border-r">
          {/* Arcade Playback Toolbar */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/70 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!engineReady || isCompiling}
                onClick={() =>
                  isPlaying ? setIsPlaying(false) : runCode(true)
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Running
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="size-3.5" aria-hidden />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" aria-hidden />
                    Run
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!engineReady || isCompiling}
                onClick={handleStep}
                title="Step forward"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-input px-2.5 text-xs font-semibold text-body hover:bg-hover hover:text-foreground disabled:opacity-50"
              >
                <SkipForward className="size-3.5" aria-hidden />
                Step
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Reset robot"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-input px-2.5 text-xs font-semibold text-danger hover:bg-hover"
              >
                <Square className="size-3" aria-hidden />
                Reset
              </button>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                <span>Speed</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  aria-label="Playback speed"
                  className="w-24 accent-accent"
                />
              </label>

              <div className="flex min-w-[130px] max-w-[180px] flex-1 items-center gap-2">
                <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-muted">
                  Fuel
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full border border-line/60 bg-input">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${fuelColor}`}
                    style={{ width: `${fuelPercent}%` }}
                  />
                </div>
                <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-foreground">
                  {fuelRemaining}
                </span>
              </div>

              {level.tokens.length > 0 && (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-warning">
                  Tokens: {currentFrame.carried}
                </span>
              )}
            </div>
          </div>

          {/* World Stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-canvas p-6">
            {showHint && (
              <div className="absolute left-4 right-4 top-4 z-20 mx-auto max-w-lg rounded-xl border border-amber-500/35 bg-surface px-4 py-2.5 text-center text-xs text-foreground shadow-lg">
                <span className="mr-1.5 font-semibold text-warning">Hint:</span>
                {level.hint}
              </div>
            )}

            <MazeGrid level={level} frame={currentFrame} trail={trail} />

            {verdict && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-canvas/75 p-4 backdrop-blur-[2px]">
                <div
                  className={`flex max-w-xs flex-col items-center rounded-2xl border bg-surface p-6 text-center shadow-xl ${
                    verdict.passed
                      ? "border-emerald-500/60"
                      : currentFrame.error
                        ? "border-danger/60"
                        : "border-warning/60"
                  }`}
                >
                  <h3
                    className={`mb-1.5 text-sm font-bold uppercase tracking-wider ${
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
                  </h3>
                  <p className="mb-5 text-xs leading-relaxed text-muted">
                    {verdict.message}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-lg border border-line bg-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-hover"
                    >
                      Try again
                    </button>
                    {verdict.passed && hasNextLevel && (
                      <button
                        type="button"
                        onClick={() => selectLevel(levelIdx + 1)}
                        className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-on-accent hover:bg-accent-hover"
                      >
                        Next Mission
                        <ArrowRight className="size-3.5" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Telemetry Status Strip */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface px-4 py-2 font-mono text-xs">
            <span
              className={
                runtimeError || currentFrame.error
                  ? "text-danger"
                  : verdict?.passed
                    ? "text-success"
                    : "text-body"
              }
            >
              {statusText}
            </span>
            <span className="shrink-0 text-[11px] text-muted">
              Pos ({currentFrame.x}, {currentFrame.y}) · Facing{" "}
              {currentFrame.dir}
            </span>
          </div>
        </section>

        {/* Right: Python Code Studio */}
        <section className="flex min-h-0 flex-1 basis-0 flex-col bg-surface">
          <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-3">
            <div className="flex items-center gap-3">
              <span className="border-b-2 border-accent px-3 py-2.5 font-mono text-xs font-semibold text-foreground">
                main.py
              </span>
              {!engineReady && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  Loading Python...
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => updateLevelCode(level.starterCode)}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-input px-2.5 py-1 text-xs font-medium text-muted hover:bg-hover hover:text-foreground"
            >
              <RotateCcw className="size-3" aria-hidden />
              Reset code
            </button>
          </div>

          {showDocs && (
            <div className="grid shrink-0 grid-cols-2 gap-1.5 border-b border-line bg-canvas/60 p-3 sm:grid-cols-3">
              {REEBORG_COMMANDS.map((cmd) => (
                <button
                  key={cmd.name}
                  type="button"
                  onClick={() => insertCommand(cmd.name)}
                  className="flex flex-col items-start rounded-lg border border-line bg-surface px-2.5 py-1.5 text-left transition-colors hover:border-accent/50 hover:bg-hover"
                >
                  <code className="font-mono text-[11px] font-semibold text-accent">
                    {cmd.name}
                  </code>
                  <span className="text-[10px] text-muted">{cmd.desc}</span>
                </button>
              ))}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              onChange={updateLevelCode}
              extensions={editorExtensions}
              theme={theme === "dark" ? dracula : githubLight}
              className="h-full"
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                autocompletion: false,
              }}
              height="100%"
            />
          </div>

          {consoleOut && (
            <div className="shrink-0 border-t border-line bg-canvas px-4 py-2.5">
              <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                Console
              </p>
              <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-body">
                {consoleOut}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
