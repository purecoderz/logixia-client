import { useMemo, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LessonDetail, LessonPatch } from "../../types/lesson";
import type { CourseOutline } from "../../types/outline";
import { useUpdateLesson } from "../../hooks/useUpdateLesson";
import { useAutosave } from "../../hooks/useAutosave";
import { builderPath, COURSES_PATH, lessonEditorPath } from "../../utils/paths";
import { SaveIndicator } from "./courseEditor/SaveIndicator";
import { MarkdownSplitEditor } from "./courseEditor/MarkdownSplitEditor";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";

interface Draft {
  title: string;
  content: string;
}

const sameDraft = (a: Draft, b: Draft) =>
  a.title === b.title && a.content === b.content;
const hasTitle = (d: Draft) => d.title.trim() !== "";

interface LessonEditorViewProps {
  courseId: string;
  lesson: LessonDetail;
  outline: CourseOutline;
  /** Only for tests. */
  autosaveDelay?: number;
}

export function LessonEditorView({
  courseId,
  lesson,
  outline,
  autosaveDelay,
}: LessonEditorViewProps) {
  const navigate = useNavigate();
  const update = useUpdateLesson(courseId, String(lesson.id));

  const [initial] = useState<Draft>(() => ({
    title: lesson.title,
    content: lesson.content,
  }));
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const draft = useMemo(() => ({ title, content }), [title, content]);

  const { status, flush, retry } = useAutosave<Draft>({
    value: draft,
    initial,
    equals: sameDraft,
    isValid: hasTitle,
    delay: autosaveDelay,
    save: async (next, saved) => {
      const patch: LessonPatch = {};
      if (next.title !== saved.title) patch.title = next.title.trim();
      if (next.content !== saved.content) patch.content = next.content;
      await update.mutateAsync(patch);
    },
  });

  // Where this lesson sits in the course, from the outline we already have
  const where = useMemo(() => {
    const all = outline.modules.flatMap((m, mi) =>
      m.lessons.map((l, li) => ({
        lesson: l,
        moduleNumber: mi + 1,
        lessonNumber: li + 1,
      })),
    );
    const index = all.findIndex((x) => x.lesson.id === lesson.id);
    return {
      current: all[index],
      previous: all[index - 1],
      next: all[index + 1],
    };
  }, [outline, lesson.id]);

  /** Save first, then go. If the save fails, stay here so nothing is lost. */
  function goTo(to: string) {
    return async (e: MouseEvent) => {
      e.preventDefault();
      if (await flush()) navigate(to);
    };
  }

  const titleMissing = title.trim() === "";

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <PageBreadcrumbs
            items={[
              { label: "Courses", to: COURSES_PATH },
              { label: outline.title, to: builderPath(courseId) },
              {
                label: where.current
                  ? `Lesson ${where.current.moduleNumber}.${where.current.lessonNumber}`
                  : "Lesson",
              },
            ]}
          />

          {where.current && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Lesson {where.current.moduleNumber}.{where.current.lessonNumber}
            </p>
          )}

          <label htmlFor="lesson-title" className="sr-only">
            Lesson title
          </label>
          <input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={titleMissing ? true : undefined}
            aria-describedby={titleMissing ? "lesson-title-error" : undefined}
            placeholder="Lesson title"
            className="w-full border-0 border-b border-transparent bg-transparent px-0 pb-1.5 text-xl font-semibold tracking-tight text-foreground placeholder:text-gray-600 hover:border-line focus:border-accent focus:outline-none aria-[invalid=true]:border-red-400 sm:text-2xl"
          />
          {titleMissing && (
            <p
              id="lesson-title-error"
              role="alert"
              className="mt-1 text-xs text-danger"
            >
              Give the lesson a title. Nothing is saved until it has one.
            </p>
          )}
        </div>

        <div className="shrink-0 pt-5">
          <SaveIndicator status={status} onRetry={() => void retry()} />
        </div>
      </header>

      <MarkdownSplitEditor
        id="lesson-content"
        label="Lesson content"
        value={content}
        onChange={setContent}
      />

      <nav
        aria-label="Lessons"
        className="flex flex-wrap justify-between gap-3"
      >
        {where.previous ? (
          <Link
            to={lessonEditorPath(courseId, where.previous.lesson.id)}
            onClick={goTo(lessonEditorPath(courseId, where.previous.lesson.id))}
            className="min-h-11 max-w-xs rounded-lg px-3 py-2 text-sm text-body hover:bg-surface"
          >
            <span className="block text-xs text-muted">← Previous</span>
            <span className="block truncate font-semibold">
              {where.previous.lesson.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {where.next && (
          <Link
            to={lessonEditorPath(courseId, where.next.lesson.id)}
            onClick={goTo(lessonEditorPath(courseId, where.next.lesson.id))}
            className="min-h-11 max-w-xs rounded-lg px-3 py-2 text-right text-sm text-body hover:bg-surface"
          >
            <span className="block text-xs text-muted">Next →</span>
            <span className="block truncate font-semibold">
              {where.next.lesson.title}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
