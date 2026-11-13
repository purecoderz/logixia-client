import { Sparkles } from "lucide-react";
import type { Direction, MazeLevel, TraceFrame } from "./reeborgLevels";

const getSpriteXPosition = (dir: Direction): string => {
  switch (dir) {
    case "E":
      return "0%";
    case "N":
      return "33.33%";
    case "W":
      return "66.66%";
    case "S":
      return "100%";
  }
};

const ROBOT_SPRITE_URL = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40"><g transform="translate(10,5)"><rect x="4" y="0" width="14" height="14" rx="2" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="6" y="14" width="10" height="12" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="8" y="26" width="6" height="8" fill="%23FBBF24"/><rect x="12" y="3" width="4" height="4" fill="%231E293B"/><path d="M12 20 L18 20" stroke="%23B45309" stroke-width="2"/></g><g transform="translate(50,5)"><rect x="2" y="0" width="18" height="14" rx="2" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="4" y="14" width="14" height="12" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="6" y="26" width="4" height="8" fill="%23FBBF24"/><rect x="12" y="26" width="4" height="8" fill="%23FBBF24"/><rect x="6" y="2" width="10" height="10" fill="%23B45309" opacity="0.3"/></g><g transform="translate(90,5)"><rect x="4" y="0" width="14" height="14" rx="2" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="6" y="14" width="10" height="12" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="8" y="26" width="6" height="8" fill="%23FBBF24"/><rect x="6" y="3" width="4" height="4" fill="%231E293B"/><path d="M4 20 L10 20" stroke="%23B45309" stroke-width="2"/></g><g transform="translate(130,5)"><rect x="2" y="0" width="18" height="14" rx="2" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="4" y="14" width="14" height="12" fill="%23FBBF24" stroke="%23B45309" stroke-width="2"/><rect x="6" y="26" width="4" height="8" fill="%23FBBF24"/><rect x="12" y="26" width="4" height="8" fill="%23FBBF24"/><rect x="5" y="4" width="4" height="4" fill="%231E293B"/><rect x="13" y="4" width="4" height="4" fill="%231E293B"/><rect x="8" y="10" width="6" height="2" fill="%23B45309"/></g></svg>')`;

interface MazeGridProps {
  level: MazeLevel;
  frame: TraceFrame;
  trail?: { x: number; y: number }[];
}

export function MazeGrid({ level, frame, trail = [] }: MazeGridProps) {
  const rightWallSet = new Set(level.rightWalls);
  const topWallSet = new Set(level.topWalls);
  const blockedSet = new Set(level.blockedCells ?? []);

  // Render rows from top (level.rows) down to bottom (1) like Reeborg's World
  const yCoords = Array.from({ length: level.rows }, (_, i) => level.rows - i);
  const xCoords = Array.from({ length: level.cols }, (_, i) => i + 1);

  const robotWrapperStyle = {
    left: `${((frame.x - 1) / level.cols) * 100}%`,
    top: `${((level.rows - frame.y) / level.rows) * 100}%`,
    width: `${100 / level.cols}%`,
    height: `${100 / level.rows}%`,
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="flex items-stretch gap-2">
        {/* Y-axis labels */}
        <div
          className="grid gap-0 py-1 text-right font-mono text-[11px] text-muted"
          style={{
            gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
          }}
        >
          {yCoords.map((y) => (
            <div key={y} className="flex items-center justify-end pr-1">
              {y}
            </div>
          ))}
        </div>

        {/* Light Reeborg-style Grid */}
        <div
          className="relative grid border-[6px] border-slate-700 bg-slate-50 shadow-sm"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, minmax(44px, 56px))`,
            gridTemplateRows: `repeat(${level.rows}, minmax(44px, 56px))`,
          }}
          role="grid"
          aria-label={`${level.title} grid (${level.cols} by ${level.rows})`}
        >
          {yCoords.map((y) =>
            xCoords.map((x) => {
              const key = `${x},${y}`;
              const isGoal = level.goal.x === x && level.goal.y === y;
              const tokenCount = frame.tokens[key] ?? 0;
              const hasRightWall = rightWallSet.has(key);
              const hasTopWall = topWallSet.has(key);
              const isBlockedCell = blockedSet.has(key);

              return (
                <div
                  key={key}
                  className={`relative box-border flex items-center justify-center border-[0.5px] border-slate-200 ${
                    hasRightWall ? "border-r-[5px] border-r-slate-700" : ""
                  } ${hasTopWall ? "border-t-[5px] border-t-slate-700" : ""}`}
                >
                  {/* Solid Wall Block (TILE_WALL) */}
                  {isBlockedCell && (
                    <div className="flex h-[82%] w-[82%] items-center justify-center rounded-sm border border-slate-800/40 bg-slate-700 shadow-inner">
                      <div className="h-[55%] w-[55%] rounded-sm border border-slate-500/40" />
                    </div>
                  )}

                  {/* Goal Flag */}
                  {isGoal && (
                    <div
                      className="relative flex h-full w-full items-end justify-center pb-1.5"
                      title={`Goal (${x}, ${y})`}
                    >
                      <div className="h-[62%] w-0.5 bg-slate-500" />
                      <div
                        className="absolute left-1/2 top-[20%] h-0 w-0"
                        style={{
                          borderTop: "5px solid transparent",
                          borderBottom: "5px solid transparent",
                          borderLeft: "10px solid #10B981",
                        }}
                      />
                    </div>
                  )}

                  {/* Tokens / Beepers */}
                  {tokenCount > 0 && (
                    <div
                      className="z-10 flex items-center gap-0.5 rounded-full border border-amber-500/70 bg-amber-400/25 px-1.5 py-0.5 text-[11px] font-bold text-amber-700"
                      title={`${tokenCount} token${tokenCount > 1 ? "s" : ""}`}
                    >
                      <Sparkles className="size-3" aria-hidden />
                      {tokenCount > 1 && <span>{tokenCount}</span>}
                    </div>
                  )}
                </div>
              );
            }),
          )}

          {/* Amber Breadcrumb Trail */}
          {trail.slice(0, -1).map((t, i) => (
            <div
              key={`${t.x}-${t.y}-${i}`}
              className="pointer-events-none absolute rounded-full bg-amber-400"
              style={{
                width: 6,
                height: 6,
                left: `calc(${((t.x - 1) / level.cols) * 100}% + ${100 / level.cols / 2}% - 3px)`,
                top: `calc(${((level.rows - t.y) / level.rows) * 100}% + ${100 / level.rows / 2}% - 3px)`,
                opacity: 0.15 + (0.5 * i) / Math.max(trail.length - 1, 1),
              }}
            />
          ))}

          {/* Smoothly Positioned 4-Direction Reeborg Robot Sprite */}
          <div
            className="pointer-events-none absolute z-20 flex items-center justify-center transition-all duration-200 ease-in-out"
            style={robotWrapperStyle}
            title={`Robot at (${frame.x}, ${frame.y}) facing ${frame.dir}`}
          >
            <div
              className={`absolute h-[74%] w-[74%] rounded-full ${
                frame.error
                  ? "bg-rose-500/30 ring-2 ring-rose-500"
                  : "animate-pulse bg-amber-400/20"
              }`}
            />
            <div
              style={{
                backgroundImage: ROBOT_SPRITE_URL,
                height: "78%",
                aspectRatio: "1 / 1",
                backgroundSize: "auto 100%",
                backgroundPositionX: getSpriteXPosition(frame.dir),
                backgroundPositionY: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="mt-1.5 flex items-center gap-2">
        <div className="w-4" />
        <div
          className="grid gap-0 text-center font-mono text-[11px] text-muted"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, minmax(44px, 56px))`,
          }}
        >
          {xCoords.map((x) => (
            <div key={x}>{x}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
