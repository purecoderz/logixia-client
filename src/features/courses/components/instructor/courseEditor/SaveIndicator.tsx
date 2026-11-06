import { Spinner } from "@/components/ui/Spinner";
import type { SaveStatus } from "@/features/courses/hooks/useAutosave";


export function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-11 items-center gap-2 text-sm">
      {status === "saving" && (
        <span className="flex items-center gap-2 text-muted">
          <Spinner size={14} /> Saving…
        </span>
      )}
      {status === "saved" && (
        <span className="flex items-center gap-2 text-success">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8.5l3.2 3L13 4.5" />
          </svg>
          Saved
        </span>
      )}
      {status === "dirty" && <span className="text-muted">Unsaved changes</span>}
      {status === "error" && (
        <span className="flex items-center gap-2 text-danger">
          Couldn’t save your changes.
          <button type="button" onClick={onRetry} className="min-h-11 rounded-lg px-2 font-semibold text-accent hover:bg-surface-muted">
            Try again
          </button>
        </span>
      )}
    </div>
  );
}
