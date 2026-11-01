import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusChip } from "../../../../../components/ui/StatusChip";
import type { CourseOutline, OutlineIssue } from "../../../types/outline";
import { AddModuleForm } from "./AddModuleForm";
import { useAddLesson } from "@/features/courses/hooks/useAddLesson";
import { ModuleCard } from "../ModuleCard";
import { PublishChecklist } from "../PublishChecklist";


// TODO: change if your courses list route is named differently
const COURSES_PATH = "/instructor/courses";

export function CourseBuilderView({ outline }: { outline: CourseOutline }) {
  const [openModules, setOpenModules] = useState<Set<number>>(
    () => new Set(outline.modules.slice(0, 1).map((m) => m.id)),
  );
  const [openLessons, setOpenLessons] = useState<Set<number>>(new Set());
  const addLesson = useAddLesson(String(outline.id));

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

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 flex gap-2 text-sm text-gray-400">
          <Link to={COURSES_PATH} className="hover:text-gray-200 hover:underline">
            Courses
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-gray-200">
            Builder
          </span>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-50">{outline.title}</h1>
          <StatusChip tone={outline.isPublished ? "success" : "draft"}>
            {outline.isPublished ? "Published" : "Draft"}
          </StatusChip>
        </div>
        <p className="mt-1.5 text-sm text-gray-400">
          The table of contents students will see before they buy.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:items-start">
        <main aria-label="Course outline" className="space-y-3">
          {outline.modules.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 px-6 py-8 text-center">
              <p className="font-semibold text-gray-50">Start by adding your first module</p>
              <p className="mt-1.5 text-sm text-gray-400">
                A module groups related lessons, like “Getting started” or “Working with files”.
              </p>
            </div>
          )}

          {outline.modules.map((m, i) => (
            <ModuleCard
              key={m.id}
              module={m}
              number={i + 1}
              open={openModules.has(m.id)}
              onToggle={() => setOpenModules((s) => toggle(s, m.id))}
              openLessons={openLessons}
              onToggleLesson={(id) => setOpenLessons((s) => toggle(s, id))}
              onAddLesson={(moduleId, title) => addLesson.mutateAsync({ moduleId, title })}
            />
          ))}

          <AddModuleForm
            courseId={String(outline.id)}
            moduleCount={outline.modules.length}
            onAdded={(id) => setOpenModules((s) => new Set(s).add(id))}
          />
        </main>

        <PublishChecklist issues={outline.issues} counts={counts} onFix={fix} />
      </div>
    </div>
  );
}