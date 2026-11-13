import { useMemo } from "react";
import { Flame, Trophy } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Assignment } from "@/features/assignments/services/assignmentService";
import {
  getTodayDateKey,
  useDailyChallenge,
} from "../../services/dailyChallengeStore";
import { useDailyChallengeActivity } from "../../services/dailyChallengeService";
import { DashboardCard } from "./DashboardCard";

const WEEKS_TO_SHOW = 24;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const LEVEL_CLASSES = [
  "bg-input border-line/60",
  "bg-emerald-500/25 border-emerald-500/35",
  "bg-emerald-500/50 border-emerald-500/60",
  "bg-emerald-500/75 border-emerald-500/80",
  "bg-[#3fb950] border-[#3fb950]",
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getLevel(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export function StreakBoardCard({
  assignments = [],
}: {
  assignments?: Assignment[];
}) {
  const { profile } = useAuth();
  const { completedDates } = useDailyChallenge();
  const { data: backendActivity } = useDailyChallengeActivity(WEEKS_TO_SHOW);

  const {
    weeks,
    monthHeaders,
    currentStreak,
    bestStreak,
    totalActiveDays,
  } = useMemo(() => {
    const countsByDate = new Map<string, number>();

    if (backendActivity) {
      // Backend daily-challenge activity is the source of truth when available.
      for (const item of backendActivity.activity) {
        if (item.is_correct || item.xp_earned > 0) {
          countsByDate.set(item.date, (countsByDate.get(item.date) ?? 0) + 1);
        }
      }
    } else {
      // Fallback: user profile streak + local daily challenges + cohort tasks.
      if (
        profile?.last_streak_date &&
        typeof profile.current_streak === "number" &&
        profile.current_streak > 0
      ) {
        const anchor = new Date(profile.last_streak_date);
        if (!Number.isNaN(anchor.getTime())) {
          for (let i = 0; i < profile.current_streak; i++) {
            const d = new Date(anchor);
            d.setDate(anchor.getDate() - i);
            const key = toDateKey(d);
            countsByDate.set(key, Math.max(countsByDate.get(key) ?? 0, 1));
          }
        }
      }

      for (const dateKey of completedDates) {
        countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
      }

      for (const task of assignments) {
        if (task.uiStatus === "done" || task.status === "completed") {
          const rawDate = task.due_date || task.start_date;
          if (rawDate) {
            const parsed = new Date(rawDate);
            if (!Number.isNaN(parsed.getTime())) {
              const key = toDateKey(parsed);
              countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
            }
          }
        }
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align the end of the grid to the end of the current week (Saturday)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const totalDays = WEEKS_TO_SHOW * 7;
    const startDate = new Date(endOfWeek);
    startDate.setDate(endOfWeek.getDate() - (totalDays - 1));

    const weeksList: {
      dateKey: string;
      label: string;
      count: number;
      isFuture: boolean;
      isToday: boolean;
      monthShort: string;
    }[][] = [];

    const todayKey = getTodayDateKey(today);

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const week: (typeof weeksList)[number] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        const dateKey = toDateKey(cellDate);
        const isFuture = cellDate.getTime() > today.getTime();
        const count = isFuture ? 0 : (countsByDate.get(dateKey) ?? 0);
        week.push({
          dateKey,
          label: cellDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          count,
          isFuture,
          isToday: dateKey === todayKey,
          monthShort: cellDate.toLocaleDateString(undefined, {
            month: "short",
          }),
        });
      }
      weeksList.push(week);
    }

    // Build month headers when month changes at the start of a week
    const headers: { weekIndex: number; label: string }[] = [];
    let lastMonth = "";
    weeksList.forEach((week, idx) => {
      const firstDayMonth = week[0].monthShort;
      if (firstDayMonth !== lastMonth) {
        headers.push({ weekIndex: idx, label: firstDayMonth });
        lastMonth = firstDayMonth;
      }
    });

    // Compute current streak & best streak across the past 365 days
    let curStreak = 0;
    let maxStreak = 0;
    let running = 0;

    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d);
      if ((countsByDate.get(key) ?? 0) > 0) {
        running += 1;
        if (running > maxStreak) maxStreak = running;
      } else if (i > 0) {
        running = 0;
      }
    }

    // Current streak walking backwards from today (or yesterday if today isn't done yet)
    const checkCursor = new Date(today);
    if ((countsByDate.get(toDateKey(checkCursor)) ?? 0) === 0) {
      checkCursor.setDate(checkCursor.getDate() - 1);
    }
    while ((countsByDate.get(toDateKey(checkCursor)) ?? 0) > 0) {
      curStreak += 1;
      checkCursor.setDate(checkCursor.getDate() - 1);
    }

    const resolvedCurrent =
      typeof backendActivity?.current_streak === "number"
        ? backendActivity.current_streak
        : typeof profile?.current_streak === "number"
          ? Math.max(profile.current_streak, curStreak)
          : curStreak;
    const resolvedBest =
      typeof backendActivity?.longest_streak === "number"
        ? backendActivity.longest_streak
        : typeof profile?.longest_streak === "number"
          ? Math.max(profile.longest_streak, maxStreak, resolvedCurrent)
          : Math.max(maxStreak, resolvedCurrent);

    return {
      weeks: weeksList,
      monthHeaders: headers,
      currentStreak: resolvedCurrent,
      bestStreak: resolvedBest,
      totalActiveDays: countsByDate.size,
    };
  }, [
    assignments,
    completedDates,
    profile?.current_streak,
    profile?.last_streak_date,
    profile?.longest_streak,
  ]);

  return (
    <DashboardCard
      title="Activity & Streak"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-warning">
            <Flame className="size-3.5" aria-hidden />
            {currentStreak}d streak
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-input px-2.5 py-0.5 font-mono text-[11px] text-muted">
            <Trophy className="size-3 text-accent" aria-hidden />
            Best: {bestStreak}d
          </span>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex min-w-full flex-col gap-1.5">
            {/* Month Labels Row */}
            <div className="flex items-center pl-8 text-[10px] font-medium text-muted">
              <div
                className="grid flex-1"
                style={{
                  gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, minmax(12px, 1fr))`,
                  gap: "4px",
                }}
              >
                {weeks.map((_, idx) => {
                  const header = monthHeaders.find((h) => h.weekIndex === idx);
                  return (
                    <span key={idx} className="truncate">
                      {header ? header.label : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Day Labels + 7x24 Contribution Grid */}
            <div className="flex items-start gap-2">
              <div className="grid grid-rows-7 gap-[4px] pr-1 text-[10px] leading-[12px] text-muted">
                {DAY_LABELS.map((label, idx) => (
                  <span key={idx} className="h-3 flex items-center">
                    {label}
                  </span>
                ))}
              </div>

              <div
                className="grid flex-1"
                style={{
                  gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, minmax(12px, 1fr))`,
                  gap: "4px",
                }}
              >
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-[4px]">
                    {week.map((day) => {
                      const level = getLevel(day.count);
                      return (
                        <div
                          key={day.dateKey}
                          title={
                            day.isFuture
                              ? day.label
                              : `${day.count} ${day.count === 1 ? "activity" : "activities"} on ${day.label}`
                          }
                          className={`h-3 w-full rounded-[3px] border transition-transform hover:scale-110 ${
                            day.isFuture
                              ? "border-transparent bg-input/30 opacity-35"
                              : LEVEL_CLASSES[level]
                          } ${day.isToday ? "ring-1 ring-accent" : ""}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2.5 text-[11px] text-muted">
          <span>
            {totalActiveDays} active {totalActiveDays === 1 ? "day" : "days"}{" "}
            recorded
          </span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {LEVEL_CLASSES.map((cls, idx) => (
              <span
                key={idx}
                aria-hidden
                className={`size-3 rounded-[3px] border ${cls}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
