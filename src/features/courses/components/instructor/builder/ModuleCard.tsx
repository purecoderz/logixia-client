import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionMenu, type MenuItem } from "@/components/ui/ActionMenu";
import { StatusChip } from "@/components/ui/StatusChip";
import type { OutlineModule } from "@/features/courses/types/outline";
import { lessonEditorPath } from "@/features/courses/utils/paths";
import { AddItemForm } from "./AddItemForm";
import { InlineRename } from "./InlineRename";
import { useNavigate } from "react-router-dom";   // join your existing react-router-dom import
import { newCodeTaskPath, newQuizTaskPath, taskEditorPath, tasksForModulePath } from "@/features/tasks/paths";

type Kind = "module" | "lesson";

export interface OutlineActions {
  rename: (kind: Kind, id: number, title: string) => Promise<void>; // throws on failure
  move: (kind: Kind, id: number, direction: -1 | 1) => Promise<void>; // never throws, reports itself
  remove: (kind: Kind, id: number) => void; // opens the confirm
}

/** Focus an element once the list has re-rendered, for example after a move or a rename. */
export function focusLater(id: string) {
  requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.focus()));
}

interface ModuleCardProps {
  courseId: string;
  module: OutlineModule;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  open: boolean;
  onToggle: () => void;
  openLessons: Set<number>;
  onToggleLesson: (lessonId: number) => void;
  onAddLesson: (moduleId: number, title: string) => Promise<{ id: number }>;
  actions: OutlineActions;
}

const chevron = (open: boolean) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={open ? "M4 6l4 4 4-4" : "M6 4l4 4-4 4"} />
  </svg>
);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function menuFor(kind: Kind, id: number, first: boolean, last: boolean, actions: OutlineActions, rename: () => void, extra: MenuItem[] = []): MenuItem[] {
  return [
    { label: "Rename", onSelect: rename },
    ...extra,
    ...(first ? [] : [{ label: "Move up", onSelect: () => void actions.move(kind, id, -1) }]),
    ...(last ? [] : [{ label: "Move down", onSelect: () => void actions.move(kind, id, 1) }]),
    { label: "Delete", onSelect: () => actions.remove(kind, id) },
  ];
}

export function ModuleCard({
  courseId, module: m, number, isFirst, isLast, open, onToggle, openLessons, onToggleLesson, onAddLesson, actions,
}: ModuleCardProps) {
  const [renamingModule, setRenamingModule] = useState(false);
  const [renamingLesson, setRenamingLesson] = useState<number | null>(null);
  const taskCount = m.lessons.reduce((sum, l) => sum + l.tasks.length, 0);

  const endModuleRename = () => {
    setRenamingModule(false);
    focusLater(`module-${m.id}`);
  };
  const endLessonRename = (lessonId: number) => {
    setRenamingLesson(null);
    focusLater(`lesson-${lessonId}`);
  };

  const navigate = useNavigate();

  return (
    <section className="rounded-xl border border-line bg-surface-muted/30">
      <div className="flex items-center gap-2 px-2 py-1.5">
        {renamingModule ? (
          <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-2.5">
            <span className="shrink-0 text-xs font-semibold text-muted">Module {number}</span>
            <InlineRename
              label={`Module ${number} title`}
              value={m.title}
              onSave={async (title) => {
                await actions.rename("module", m.id, title);
                endModuleRename();
              }}
              onCancel={endModuleRename}
            />
          </div>
        ) : (
          <button
            type="button"
            id={`module-${m.id}`}
            aria-expanded={open}
            onClick={onToggle}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 text-left hover:bg-surface-muted/60"
          >
            <span className="text-muted">{chevron(open)}</span>
            <span className="shrink-0 text-xs font-semibold text-muted">Module {number}</span>
            <span className="truncate font-semibold text-foreground">{m.title}</span>
          </button>
        )}

        <span className="hidden shrink-0 text-xs text-muted sm:block">
          {plural(m.lessons.length, "lesson")} · {plural(taskCount, "task")}
        </span>
        {m.lessons.length === 0 && <StatusChip tone="warning">No lessons</StatusChip>}
        <ActionMenu
          id={`module-menu-${m.id}`}
          label={`Actions for module ${number}: ${m.title}`}
          items={menuFor("module", m.id, isFirst, isLast, actions, () => setRenamingModule(true), [
            { label: "View tasks", onSelect: () => navigate(tasksForModulePath(courseId, m.id)) },
          ])}
        />
      </div>

      {open && (
        <div className="border-t border-line">
          {m.lessons.length === 0 ? (
            <p className="px-5 pt-4 text-sm text-muted">This module has no lessons yet.</p>
          ) : (
            <ul>
              {m.lessons.map((lesson, i) => {
                const lessonOpen = openLessons.has(lesson.id);
                const lessonNumber = `${number}.${i + 1}`;
                return (
                  <li key={lesson.id} className="border-b border-line last:border-b-0">
                    {renamingLesson === lesson.id ? (
                      <div className="flex min-h-14 items-center gap-3 px-5 py-2">
                        <span className="w-8 shrink-0 text-xs font-semibold text-muted">{lessonNumber}</span>
                        <InlineRename
                          label={`Lesson ${lessonNumber} title`}
                          value={lesson.title}
                          onSave={async (title) => {
                            await actions.rename("lesson", lesson.id, title);
                            endLessonRename(lesson.id);
                          }}
                          onCancel={() => endLessonRename(lesson.id)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 pr-2">
                        <button
                          type="button"
                          id={`lesson-${lesson.id}`}
                          aria-expanded={lessonOpen}
                          onClick={() => onToggleLesson(lesson.id)}
                          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 pr-3 pl-5 text-left hover:bg-surface-muted/40"
                        >
                          <span className="w-8 shrink-0 text-xs font-semibold text-muted">{lessonNumber}</span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{lesson.title}</span>
                          <span className="shrink-0 text-xs text-muted">{plural(lesson.tasks.length, "task")}</span>
                          <StatusChip tone={lesson.hasContent ? "success" : "warning"}>
                            {lesson.hasContent ? "Ready" : "No content"}
                          </StatusChip>
                        </button>
                        <Link
                          to={lessonEditorPath(courseId, lesson.id)}
                          className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-accent hover:bg-surface-muted"
                        >
                          Edit<span className="sr-only"> {lesson.title}</span>
                        </Link>
                        <ActionMenu
                          id={`lesson-menu-${lesson.id}`}
                          label={`Actions for lesson ${lessonNumber}: ${lesson.title}`}
                          items={menuFor("lesson", lesson.id, i === 0, i === m.lessons.length - 1, actions, () =>
                            setRenamingLesson(lesson.id),
                          )}
                        />
                      </div>
                    )}

                    {lessonOpen && (
                      <ul className="space-y-1 bg-input/40 py-2 pr-5 pl-[4.25rem]">
                        {lesson.tasks.length === 0 ? (
                          <li className="min-h-10 py-2 text-sm text-muted">No tasks yet.</li>
                        ) : (
                          lesson.tasks.map((task) => (
                            <li key={task.id} className="flex min-h-10 items-center gap-3 text-sm text-body">
                              <Link to={taskEditorPath(courseId,task.id)} className="min-w-0 flex-1 truncate hover:text-accent hover:underline">{task.title}</Link>
                              <span className="shrink-0 text-xs text-muted">{task.type === "code" ? "Code task" : "Quiz"}</span>
                            </li>
                          ))
                        )}

                        <li className="pt-2">
                          <Link to={newCodeTaskPath(courseId,lesson.id)} className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm font-semibold text-accent hover:bg-hover">Add code task</Link>
                        </li>
                        <li className="pt-2">
                          <Link to={newQuizTaskPath(courseId,lesson.id)} className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm font-semibold text-accent hover:bg-hover">Add quiz</Link>
                        </li>
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