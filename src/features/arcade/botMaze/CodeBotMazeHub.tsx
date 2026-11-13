import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Fuel,
  Grid3X3,
  Sparkles,
  Zap,
} from "lucide-react";
import { MAZE_LEVELS } from "./reeborgLevels";
import { getBotMazeCompletedIds, getBotMazeTotalXp } from "./CodeBotMazeView";

interface CodeBotMazeHubProps {
  onBack: () => void;
  onSelectLevel: (levelId: string) => void;
}

export function CodeBotMazeHub({
  onBack,
  onSelectLevel,
}: CodeBotMazeHubProps) {
  const completedIds = getBotMazeCompletedIds();
  const totalXp = getBotMazeTotalXp();
  const maxXp = MAZE_LEVELS.reduce((sum, lvl) => sum + lvl.xp, 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-hover hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Game Modes
          </button>

          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
              <Bot className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Code Bot Maze
              </h1>
              <p className="text-xs text-muted sm:text-sm">
                Choose a mission to program your robot in Python.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs font-semibold text-muted">
            {completedIds.length}/{MAZE_LEVELS.length} Completed
          </span>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs font-semibold text-foreground shadow-sm">
            <Zap className="size-4 text-warning" aria-hidden />
            <span>
              {totalXp} / {maxXp} XP
            </span>
          </div>
        </div>
      </header>

      {/* Mission Cards Grid */}
      <section
        aria-label="Code Bot Maze missions"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MAZE_LEVELS.map((lvl) => {
          const isCompleted = completedIds.includes(lvl.id);
          return (
            <article
              key={lvl.id}
              className={`student-card flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-line-strong ${
                isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                  : "border-line bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-sky-500/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-sky-400">
                    Mission {lvl.number}
                  </span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-warning">
                      <Sparkles className="size-3" aria-hidden />+{lvl.xp} XP
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  {lvl.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                  {lvl.subtitle}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Grid3X3 className="size-3.5" aria-hidden />
                    {lvl.cols}×{lvl.rows}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Fuel className="size-3.5" aria-hidden />
                    {lvl.fuelLimit} fuel
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
                    isCompleted
                      ? "border border-line bg-input text-foreground hover:bg-hover"
                      : "bg-accent text-on-accent hover:bg-accent-hover"
                  }`}
                >
                  <span>{isCompleted ? "Replay Mission" : "Start Mission"}</span>
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
