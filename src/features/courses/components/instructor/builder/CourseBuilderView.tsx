import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { StatusChip } from "@/components/ui/StatusChip";
import { useAddLesson } from "@/features/courses/hooks/useAddLesson";
import { useOutlineActions } from "@/features/courses/hooks/useOutlineActions";
import type { CourseOutline, OutlineIssue } from "@/features/courses/types/outline";
import { COURSES_PATH } from "@/features/courses/utils/paths";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { ActionNotice, type Notice } from "../ActionNotice";
import { AddModuleForm } from "./AddModuleForm";
import { focusLater, ModuleCard, type OutlineActions } from "./ModuleCard";
import { PublishChecklist } from "./PublishChecklist";
import { useUpdateCourse } from "@/features/courses/hooks/UseUpdateCourse";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function swap(ids: number[], id: number, direction: -1 | 1) {
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

interface DeleteTarget {
  kind: "module" | "lesson";
  id: number;
  title: string;
  message: string;
}

export function CourseBuilderView({ outline }: { outline: CourseOutline }) {
  const courseId = String(outline.id);
  const addLesson = useAddLesson(courseId);
  const outlineActions = useOutlineActions();
  const updateCourse = useUpdateCourse();

  const [openModules, setOpenModules] = useState<Set<number>>(() => new Set(outline.modules.slice(0, 1).map((m) => m.id)));
  const [openLessons, setOpenLessons] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState<DeleteTarget | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const dismiss = useCallback(() => setNotice(null), []);

  const toggle = (set: Set<number>, id: number) => {
    const next = new Set(set);
    if (!next.delete(id)) next.add(id);
    return next;
  };

  const counts = {
    modules: outline.modules.length,
    lessons: outline.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    tasks: outline.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.tasks.length, 0), 0),
  };

  /** A 400 carries a reason the instructor can act on ("Module 3 has no lessons"), so it is shown as is. */
  function report(error: unknown, fallback: string) {
    if (!(error instanceof ApiError)) console.error(error);
    setNotice({ kind: "error", message: friendlyMessage(error, fallback) });
  }

  /** Open whatever the issue points at, scroll to it and move focus there. */
  function fix(issue: OutlineIssue) {
    const target = issue.target;
    if (target.kind === "course") return;

    let elementId: string;
    if (target.kind === "module") {
      setOpenModules((s) => new Set(s).add(target.id));
      elementId = `module-${target.id}`;
    } else {
      const owner = outline.modules.find((m) => m.lessons.some((l) => l.id === target.id));
      if (!owner) return;
      setOpenModules((s) => new Set(s).add(owner.id));
      setOpenLessons((s) => new Set(s).add(target.id));
      elementId = `lesson-${target.id}`;
    }

    requestAnimationFrame(() => {
      const el = document.getElementById(elementId);
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      el.focus();
    });
  }

  async function setPublished(next: boolean) {
    setPublishing(true);
    setNotice(null);
    try {
      await updateCourse.mutateAsync({ courseId, patch: { is_published: next } });
      setNotice({
        kind: "success",
        message: next ? `“${outline.title}” is published.` : `“${outline.title}” is back to draft.`,
      });
    } catch (error) {
      report(error, next ? "Couldn’t publish. Please try again." : "Couldn’t unpublish. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  const actions: OutlineActions = {
    rename: async (kind, id, title) => {
      if (kind === "module") await outlineActions.renameModule.mutateAsync({ id, title });
      else await outlineActions.renameLesson.mutateAsync({ id, title });
      setAnnouncement(`Renamed to ${title}`);
    },

    move: async (kind, id, direction) => {
      setNotice(null);
      try {
        if (kind === "module") {
          const ids = swap(outline.modules.map((m) => m.id), id, direction);
          await outlineActions.reorderModules.mutateAsync({ courseId, ids });
          setAnnouncement(`Module moved to position ${ids.indexOf(id) + 1} of ${ids.length}`);
          focusLater(`module-menu-${id}`);
        } else {
          const owner = outline.modules.find((m) => m.lessons.some((l) => l.id === id));
          if (!owner) return;
          const ids = swap(owner.lessons.map((l) => l.id), id, direction);
          await outlineActions.reorderLessons.mutateAsync({ moduleId: owner.id, ids });
          setAnnouncement(`Lesson moved to position ${ids.indexOf(id) + 1} of ${ids.length}`);
          focusLater(`lesson-menu-${id}`);
        }
      } catch (error) {
        report(error, "Couldn’t move it. Please try again.");
      }
    },

    remove: (kind, id) => {
      if (kind === "module") {
        const m = outline.modules.find((x) => x.id === id);
        if (!m) return;
        const tasks = m.lessons.reduce((s, l) => s + l.tasks.length, 0);
        const inside =
          m.lessons.length === 0
            ? ""
            : ` and its ${plural(m.lessons.length, "lesson")}${tasks > 0 ? ` (with ${plural(tasks, "task")})` : ""}`;
        setConfirming({ kind, id, title: m.title, message: `“${m.title}”${inside} will be permanently deleted. This can’t be undone.` });
      } else {
        const l = outline.modules.flatMap((m) => m.lessons).find((x) => x.id === id);
        if (!l) return;
        const inside = l.tasks.length > 0 ? ` and its ${plural(l.tasks.length, "task")}` : "";
        setConfirming({ kind, id, title: l.title, message: `“${l.title}”${inside}, including everything written in it, will be permanently deleted. This can’t be undone.` });
      }
    },
  };

  async function confirmDelete() {
    const target = confirming;
    if (!target) return;
    setDeleting(true);
    setNotice(null);
    try {
      if (target.kind === "module") await outlineActions.deleteModule.mutateAsync(target.id);
      else await outlineActions.deleteLesson.mutateAsync(target.id);
      setConfirming(null);
      setAnnouncement(`“${target.title}” deleted`);
      mainRef.current?.focus();
    } catch (error) {
      setConfirming(null);
      report(error, `Couldn’t delete “${target.title}”. Please try again.`);
    } finally {
      setDeleting(false);
    }
  }

  const issueCount = outline.issues.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageBreadcrumbs items={[{ label: "Courses", to: COURSES_PATH }, { label: "Builder" }]} />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{outline.title}</h1>
            <StatusChip tone={outline.isPublished ? "success" : "draft"}>{outline.isPublished ? "Published" : "Draft"}</StatusChip>
          </div>
          <p className="mt-1.5 text-sm text-muted">The table of contents students will see before they buy.</p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {outline.isPublished ? (
            <Button variant="ghost" onClick={() => void setPublished(false)} disabled={publishing} aria-busy={publishing}>
              {publishing ? <><Spinner /> Working…</> : "Unpublish"}
            </Button>
          ) : (
            <Button onClick={() => void setPublished(true)} disabled={publishing || issueCount > 0} aria-busy={publishing}>
              {publishing ? <><Spinner tone="dark" /> Publishing…</> : "Publish"}
            </Button>
          )}
          {!outline.isPublished && issueCount > 0 && (
            <p className="text-xs text-muted">{plural(issueCount, "thing")} to fix first</p>
          )}
        </div>
      </div>

      <ActionNotice notice={notice} onDismiss={dismiss} />
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:items-start">
        <main ref={mainRef} tabIndex={-1} aria-label="Course outline" className="space-y-3 outline-none">
          {outline.modules.length === 0 && (
            <div className="rounded-xl border border-line bg-surface-muted/30 px-6 py-8 text-center">
              <p className="font-semibold text-foreground">Start by adding your first module</p>
              <p className="mt-1.5 text-sm text-muted">
                A module groups related lessons, like “Getting started” or “Working with files”.
              </p>
            </div>
          )}

          {outline.modules.map((m, i) => (
            <ModuleCard
              key={m.id}
              courseId={courseId}
              module={m}
              number={i + 1}
              isFirst={i === 0}
              isLast={i === outline.modules.length - 1}
              open={openModules.has(m.id)}
              onToggle={() => setOpenModules((s) => toggle(s, m.id))}
              openLessons={openLessons}
              onToggleLesson={(id) => setOpenLessons((s) => toggle(s, id))}
              onAddLesson={(moduleId, title) => addLesson.mutateAsync({ moduleId, title })}
              actions={actions}
            />
          ))}

          <AddModuleForm
            courseId={courseId}
            moduleCount={outline.modules.length}
            onAdded={(id) => setOpenModules((s) => new Set(s).add(id))}
          />
        </main>

        <PublishChecklist courseId={courseId} issues={outline.issues} counts={counts} onFix={fix} />
      </div>

      <ConfirmDialog
        open={confirming !== null}
        title={confirming?.kind === "module" ? "Delete this module?" : "Delete this lesson?"}
        message={confirming?.message ?? ""}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}