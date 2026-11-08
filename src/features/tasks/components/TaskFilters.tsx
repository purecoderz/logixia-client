import { Select } from "@/components/ui/Select";
import { inputClass } from "@/components/ui/formStyles";
import type { TaskKind } from "@/features/courses/types/outline";

export interface Option {
  value: string;
  label: string;
}

interface TaskFiltersProps {
  courses: Option[];
  courseId: string;
  modules: Option[];
  moduleId: string; // "all" or a module id
  type: "" | TaskKind;
  search: string;
  hasFilters: boolean;
  onCourse: (id: string) => void;
  onModule: (id: string) => void;
  onType: (type: "" | TaskKind) => void;
  onSearch: (text: string) => void;
  onClear: () => void;
}

const typeTabs: { value: "" | TaskKind; label: string }[] = [
  { value: "", label: "All" },
  { value: "code", label: "Code" },
  { value: "quiz", label: "Quiz" },
];

const labelClass = "mb-1.5 block text-xs font-semibold text-muted";

export function TaskFilters(p: TaskFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="task-course" className={labelClass}>
            Course
          </label>
          <Select
            id="task-course"
            value={p.courseId}
            onChange={p.onCourse}
            options={p.courses}
            searchable
            searchPlaceholder="Search courses…"
          />
        </div>

        <div>
          <label htmlFor="task-module" className={labelClass}>
            Module
          </label>
          <Select
            id="task-module"
            value={p.moduleId}
            disabled={p.modules.length === 0}
            onChange={p.onModule}
            searchable
            searchPlaceholder="Search modules…"
            options={[
              { value: "all", label: "All modules in this course" },
              ...p.modules,
            ]}
          />
        </div>

        <div>
          <label htmlFor="task-search" className={labelClass}>
            Search in this view
          </label>
          <input
            id="task-search"
            type="search"
            value={p.search}
            onChange={(e) => p.onSearch(e.target.value)}
            placeholder="Task or lesson title"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <div className="flex">
          {typeTabs.map((t) => {
            const active = p.type === t.value;
            return (
              <button
                key={t.label}
                type="button"
                aria-pressed={active}
                onClick={() => p.onType(t.value)}
                className={`inline-flex min-h-11 items-center border-b-2 px-3.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-body"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {p.hasFilters && (
          <button
            type="button"
            onClick={p.onClear}
            className="mb-1 min-h-11 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-surface-muted"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
