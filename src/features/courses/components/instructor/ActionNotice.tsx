import { useEffect } from "react";
import { Link } from "react-router-dom";

export interface Notice {
  kind: "success" | "error";
  message: string;
  /** A way to fix the problem, like "Open builder". */
  link?: { label: string; to: string };
  /** Puts things back, like after archiving by mistake. */
  undo?: () => void;
}

interface ActionNoticeProps {
  notice: Notice | null;
  onDismiss: () => void;
}

/**
 * The result of an action. The outer element is always on the page, so screen readers
 * pick up each new message. Successes fade away, errors stay until dismissed.
 */
export function ActionNotice({ notice, onDismiss }: ActionNoticeProps) {
  useEffect(() => {
    if (notice?.kind !== "success") return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);

  const error = notice?.kind === "error";
  const button =
    "min-h-11 rounded-lg px-2 text-sm font-semibold hover:bg-hover";

  return (
    <div role="status" aria-live="polite">
      {notice && (
        <div
          role={error ? "alert" : undefined}
          className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-400/40 bg-red-400/10 text-danger"
              : "border-emerald-400/40 bg-emerald-400/10 text-success"
          }`}
        >
          <span className="min-w-48 flex-1">{notice.message}</span>
          {notice.link && (
            <Link
              to={notice.link.to}
              className={`${button} inline-flex items-center underline`}
            >
              {notice.link.label}
            </Link>
          )}
          {notice.undo && (
            <button
              type="button"
              className={button}
              onClick={() => {
                notice.undo?.();
              }}
            >
              Undo
            </button>
          )}
          <button type="button" className={button} onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
