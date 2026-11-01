import type { OutlineIssue } from "../../types/outline";


interface PublishChecklistProps {
  issues: OutlineIssue[];
  counts: { modules: number; lessons: number; tasks: number };
  onFix: (issue: OutlineIssue) => void;
}

export function PublishChecklist({ issues, counts, onFix }: PublishChecklistProps) {
  return (
    <aside aria-label="Course checklist" className="space-y-4 lg:sticky lg:top-6">
      <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
        <p className="mb-3 text-xs font-semibold text-gray-400">Before you can sell it self-paced</p>

        {issues.length === 0 ? (
          <p className="flex items-center gap-2.5 text-sm text-gray-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8.5l3.2 3L13 4.5" />
            </svg>
            Everything is in place.
          </p>
        ) : (
          <ul className="space-y-3">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
                  <path d="M8 2.5l6 10.5H2L8 2.5zM8 7v2.8M8 11.7v.1" />
                </svg>
                <span className="flex-1">{issue.message}</span>
                {issue.target.kind !== "course" && (
                  <button
                    type="button"
                    onClick={() => onFix(issue)}
                    className="-my-2 min-h-11 shrink-0 rounded-lg px-2 text-xs font-semibold text-sky-300 hover:bg-gray-800"
                  >
                    Fix<span className="sr-only">: {issue.message}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs leading-relaxed text-gray-400">None of this is needed to run a cohort on the course.</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
        <p className="mb-3 text-xs font-semibold text-gray-400">Outline</p>
        <dl className="grid grid-cols-3 gap-2">
          {(
            [
              ["modules", counts.modules],
              ["lessons", counts.lessons],
              ["tasks", counts.tasks],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dd className="text-2xl font-bold text-gray-50">{value}</dd>
              <dt className="text-xs text-gray-400">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}