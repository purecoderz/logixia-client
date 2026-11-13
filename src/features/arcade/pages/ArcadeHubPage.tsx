import {
  Bot,
  Bug,
  Keyboard,
  Network,
  Terminal,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { CodeBotMazeHub } from "../botMaze/CodeBotMazeHub";
import {
  CodeBotMazeView,
  getBotMazeTotalXp,
} from "../botMaze/CodeBotMazeView";

interface GameModeCardConfig {
  id: string;
  title: string;
  description: string;
  xpLabel: string;
  Icon: LucideIcon;
  iconColorClass: string;
  pillColorClass: string;
  available?: boolean;
}

const GAME_MODES: GameModeCardConfig[] = [
  {
    id: "algorithm-arena",
    title: "Algorithm Arena",
    description:
      "Solve LeetCode-style algorithmic challenges with automated test cases in the split-pane IDE.",
    xpLabel: "+150 XP",
    Icon: Network,
    iconColorClass: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    pillColorClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  },
  {
    id: "bug-hunter",
    title: "Bug Hunter Blitz",
    description:
      "Spot the broken line in short code snippets before the 60-second timer runs out.",
    xpLabel: "+100 XP",
    Icon: Bug,
    iconColorClass: "text-violet-400 border-violet-500/30 bg-violet-500/10",
    pillColorClass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  },
  {
    id: "output-predictor",
    title: "Output Predictor",
    description:
      "Predict the exact terminal output of tricky code snippets to build your combo streak.",
    xpLabel: "+80 XP",
    Icon: Terminal,
    iconColorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    pillColorClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  {
    id: "code-bot-maze",
    title: "Code Bot Maze",
    description:
      "Program a visual grid robot through obstacles and mazes using loop and logic commands.",
    xpLabel: "+120 XP",
    Icon: Bot,
    iconColorClass: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    pillColorClass: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    available: true,
  },
  {
    id: "syntax-speed-run",
    title: "Syntax Speed Run",
    description:
      "Complete fill-in-the-blank syntax sprints against the clock to build muscle memory.",
    xpLabel: "+90 XP",
    Icon: Keyboard,
    iconColorClass: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    pillColorClass: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
  {
    id: "cohort-duel",
    title: "Cohort Duel",
    description:
      "Compete on weekly timed challenges to climb the podium on your cohort leaderboard.",
    xpLabel: "+200 XP",
    Icon: Trophy,
    iconColorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    pillColorClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
];

export function ArcadeHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const levelId = searchParams.get("level");

  if (mode === "code-bot-maze") {
    if (levelId) {
      return (
        <CodeBotMazeView
          initialLevelId={levelId}
          onBack={() => setSearchParams({ mode: "code-bot-maze" })}
        />
      );
    }
    return (
      <CodeBotMazeHub
        onBack={() => setSearchParams({})}
        onSelectLevel={(id) =>
          setSearchParams({ mode: "code-bot-maze", level: id })
        }
      />
    );
  }

  const totalXp = getBotMazeTotalXp();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Minimal Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            PlayGame Arcade
          </h1>
          <span className="text-base font-normal text-muted sm:text-xl">
            — Choose a Game Mode
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs font-semibold text-foreground shadow-sm">
          <Zap className="size-4 text-warning" aria-hidden />
          <span>{totalXp} XP</span>
        </div>
      </header>

      {/* 3x2 Game Mode Cards Grid */}
      <section
        aria-label="Game modes"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GAME_MODES.map((item) => {
          const { Icon } = item;
          return (
            <article
              key={item.id}
              className="student-card flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 transition-all hover:border-line-strong"
            >
              <div>
                <div
                  className={`inline-flex size-12 items-center justify-center rounded-xl border ${item.iconColorClass}`}
                >
                  <Icon className="size-6" aria-hidden />
                </div>

                <h2 className="mt-5 text-lg font-bold tracking-tight text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 pt-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${item.pillColorClass}`}
                >
                  <Zap className="size-3" aria-hidden />
                  {item.xpLabel}
                </span>

                {item.available ? (
                  <button
                    type="button"
                    onClick={() => setSearchParams({ mode: item.id })}
                    className="inline-flex items-center justify-center rounded-lg border border-line bg-input px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-accent/50 hover:bg-hover sm:text-sm"
                  >
                    Play
                  </button>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-lg border border-line/60 bg-input/50 px-4 py-2 text-xs font-medium text-muted">
                    Coming soon
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default ArcadeHubPage;
