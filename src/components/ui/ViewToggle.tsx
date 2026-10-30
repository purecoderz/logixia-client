export type View = "table" | "grid";

interface ViewToggleProps {
  value: View;
  onChange: (view: View) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-700 p-0.5" role="group" aria-label="View">
      {(["grid", "table"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          aria-label={v === "grid" ? "Grid view" : "Table view"}
          onClick={() => onChange(v)}
          className={`flex size-10 items-center justify-center rounded-md transition-colors ${
            value === v ? "bg-sky-400/15 text-sky-300" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {v === "grid" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="2" y="2" width="5" height="5" rx="1" />
              <rect x="9" y="2" width="5" height="5" rx="1" />
              <rect x="2" y="9" width="5" height="5" rx="1" />
              <rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}