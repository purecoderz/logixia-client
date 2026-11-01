import { StatusChip } from "@/components/ui/StatusChip";
import type { OutlineModule } from "../../types/outline";
import { AddItemForm } from "./builder/AddItemForm";


interface ModuleCardProps {
  module: OutlineModule;
  number: number;
  open: boolean;
  onToggle: () => void;
  openLessons: Set<number>;
  onToggleLesson: (lessonId: number) => void;
  onAddLesson: (moduleId: number, title: string) => Promise<{ id: number }>;
}

const chevron = (open: boolean) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={open ? "M4 6l4 4 4-4" : "M6 4l4 4-4 4"} />
  </svg>
);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function ModuleCard({ module: m, number, open, onToggle, openLessons, onToggleLesson, onAddLesson }: ModuleCardProps) {
  const taskCount = m.lessons.reduce((sum, l) => sum + l.tasks.length, 0);

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-800/30">
      <div className="flex items-center gap-3 px-2 py-1.5">
        <button
          type="button"
          id={`module-${m.id}`}
          aria-expanded={open}
          onClick={onToggle}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 text-left hover:bg-gray-800/60"
        >
          <span className="text-gray-400">{chevron(open)}</span>
          <span className="shrink-0 text-xs font-semibold text-gray-400">Module {number}</span>
          <span className="truncate font-semibold text-gray-50">{m.title}</span>
        </button>
        <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
          {plural(m.lessons.length, "lesson")} · {plural(taskCount, "task")}
        </span>
        {m.lessons.length === 0 && <StatusChip tone="warning">No lessons</StatusChip>}
      </div>

      {open && (
        <div className="border-t border-gray-800">
          {m.lessons.length === 0 ? (
            <p className="px-5 pt-4 text-sm text-gray-400">This module has no lessons yet.</p>
          ) : (
            <ul>
              {m.lessons.map((lesson, i) => {
                const lessonOpen = openLessons.has(lesson.id);
                return (
                  <li key={lesson.id} className="border-b border-gray-800 last:border-b-0">
                    <button
                      type="button"
                      id={`lesson-${lesson.id}`}
                      aria-expanded={lessonOpen}
                      onClick={() => onToggleLesson(lesson.id)}
                      className="flex min-h-14 w-full items-center gap-3 px-5 text-left hover:bg-gray-800/40"
                    >
                      <span className="w-8 shrink-0 text-xs font-semibold text-gray-400">
                        {number}.{i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-100">{lesson.title}</span>
                      <span className="shrink-0 text-xs text-gray-400">{plural(lesson.tasks.length, "task")}</span>
                      <StatusChip tone={lesson.hasContent ? "success" : "warning"}>
                        {lesson.hasContent ? "Ready" : "No content"}
                      </StatusChip>
                    </button>

                    {lessonOpen && (
                      <ul className="space-y-1 bg-gray-950/40 py-2 pr-5 pl-[4.25rem]">
                        {lesson.tasks.length === 0 ? (
                          <li className="min-h-10 py-2 text-sm text-gray-400">No tasks yet.</li>
                        ) : (
                          lesson.tasks.map((task) => (
                            <li key={task.id} className="flex min-h-10 items-center gap-3 text-sm text-gray-200">
                              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-800 text-sky-300">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d={task.type === "code" ? "M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5" : "M8 5v3.5M8 11v.1M2.5 8a5.5 5.5 0 1 0 11 0 5.5 5.5 0 0 0-11 0z"} />
                                </svg>
                              </span>
                              <span className="min-w-0 flex-1 truncate">{task.title}</span>
                              <span className="shrink-0 text-xs text-gray-400">{task.type === "code" ? "Code task" : "Quiz"}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="p-3">
            <AddItemForm
              noun="lesson"
              numberLabel={`Lesson ${number}.${m.lessons.length + 1}`}
              existingCount={m.lessons.length}
              inputId={`new-lesson-title-${m.id}`}
              placeholder="For example: Installing Python"
              save={(title) => onAddLesson(m.id, title)}
            />
          </div>
        </div>
      )}
    </section>
  );
}