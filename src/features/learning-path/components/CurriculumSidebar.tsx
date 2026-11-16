import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCode2,
  HelpCircle,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { isTaskDone } from "../hooks/useLearningPath";
import type { LearningPathCourse } from "../types";

interface CurriculumSidebarProps {
  course: LearningPathCourse;
  activeLessonId: number;
  activeTaskId?: number | null;
  onSelectItem?: () => void;
}

export function CurriculumSidebar({
  course,
  activeLessonId,
  activeTaskId = null,
  onSelectItem,
}: CurriculumSidebarProps) {
  const initialExpanded: Record<number, boolean> = {};
  for (const mod of course.modules) {
    if (mod.lessons.some((l) => l.id === activeLessonId)) {
      initialExpanded[mod.id] = true;
    }
  }
  const [expanded, setExpanded] =
    useState<Record<number, boolean>>(initialExpanded);

  return (
    <nav aria-label="Course curriculum" className="space-y-2 p-3">
      {course.modules.map((mod, modIndex) => {
        const isOpen = expanded[mod.id] ?? false;
        return (
          <div
            key={mod.id}
            className="overflow-hidden rounded-xl border border-line bg-canvas/50"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [mod.id]: !isOpen }))
              }
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-hover/60"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-muted">
                  {String(modIndex + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-xs font-semibold text-foreground">
                  {mod.title}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {mod.is_completed && (
                  <CheckCircle2
                    className="size-3.5 text-success"
                    aria-hidden
                  />
                )}
                {mod.is_locked && (
                  <Lock className="size-3 text-muted" aria-hidden />
                )}
                {isOpen ? (
                  <ChevronDown className="size-3.5 text-muted" aria-hidden />
                ) : (
                  <ChevronRight className="size-3.5 text-muted" aria-hidden />
                )}
              </div>
            </button>

            {isOpen && (
              <ul className="space-y-1 border-t border-line px-2 py-2">
                {mod.lessons.map((lesson) => {
                  const isActiveLesson =
                    lesson.id === activeLessonId && activeTaskId === null;
                  return (
                    <li key={lesson.id} className="space-y-1">
                      {lesson.is_locked ? (
                        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted opacity-65">
                          <Lock className="size-3.5 shrink-0" aria-hidden />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      ) : (
                        <Link
                          to={`/lessons/${lesson.id}`}
                          onClick={onSelectItem}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            isActiveLesson
                              ? "bg-accent/15 text-accent"
                              : "text-body hover:bg-hover hover:text-foreground"
                          }`}
                        >
                          {lesson.is_completed ? (
                            <CheckCircle2
                              className="size-3.5 shrink-0 text-success"
                              aria-hidden
                            />
                          ) : (
                            <BookOpen
                              className="size-3.5 shrink-0"
                              aria-hidden
                            />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </Link>
                      )}

                      {lesson.tasks.length > 0 && (
                        <ul className="ml-4 space-y-0.5 border-l border-line pl-2.5">
                          {lesson.tasks.map((task) => {
                            const done = isTaskDone(task.status);
                            const isActiveTask = task.id === activeTaskId;
                            const taskPath = `/lessons/${lesson.id}?task=${task.id}`;

                            if (task.is_locked) {
                              return (
                                <li
                                  key={task.id}
                                  className="flex items-center gap-2 rounded-md px-2 py-1 text-[11px] text-muted opacity-60"
                                >
                                  <Lock
                                    className="size-3 shrink-0"
                                    aria-hidden
                                  />
                                  <span className="truncate">{task.title}</span>
                                </li>
                              );
                            }

                            return (
                              <li key={task.id}>
                                <Link
                                  to={taskPath}
                                  onClick={onSelectItem}
                                  className={`flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-colors ${
                                    isActiveTask
                                      ? "bg-accent/15 font-semibold text-accent"
                                      : "text-muted hover:bg-hover hover:text-foreground"
                                  }`}
                                >
                                  {done ? (
                                    <CheckCircle2
                                      className="size-3 shrink-0 text-success"
                                      aria-hidden
                                    />
                                  ) : task.type === "code" ? (
                                    <FileCode2
                                      className="size-3 shrink-0 text-accent"
                                      aria-hidden
                                    />
                                  ) : (
                                    <HelpCircle
                                      className="size-3 shrink-0 text-warning"
                                      aria-hidden
                                    />
                                  )}
                                  <span className="truncate">{task.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
