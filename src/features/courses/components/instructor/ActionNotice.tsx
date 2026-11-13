import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { playNoticeSound } from "@/lib/sound";

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
    if (!notice) return;
    playNoticeSound(notice.kind);
    if (notice.kind !== "success") return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);

  const error = notice?.kind === "error";
  const button =
    "inline-flex min-h-9 items-center rounded-lg px-2.5 text-xs font-semibold hover:bg-hover";

  return (
    <div role="status" aria-live="polite">
      {notice && (
        <div
          role={error ? "alert" : undefined}
          className={`fixed bottom-5 right-5 z-[70] flex w-[calc(100vw-2.5rem)] max-w-md items-start gap-3 rounded-xl border bg-surface p-4 text-sm shadow-2xl ${
            error
              ? "border-red-500/50 text-foreground"
              : "border-emerald-500/50 text-foreground"
          }`}
        >
          {error ? (
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-danger"
              aria-hidden
            />
          ) : (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-success"
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className={error ? "font-medium text-danger" : "font-medium text-foreground"}>
              {notice.message}
            </p>
            {(notice.link || notice.undo) && (
              <div className="flex flex-wrap items-center gap-2">
                {notice.link && (
                  <Link
                    to={notice.link.to}
                    className={`${button} text-accent underline`}
                  >
                    {notice.link.label}
                  </Link>
                )}
                {notice.undo && (
                  <button
                    type="button"
                    className={`${button} border border-line text-body`}
                    onClick={() => {
                      notice.undo?.();
                    }}
                  >
                    Undo
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
