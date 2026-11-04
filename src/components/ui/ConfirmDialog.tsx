import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A confirm box built on the browser's own <dialog>: it traps focus, closes on Escape and dims the page. */
export function ConfirmDialog({ open, title, message, confirmLabel, busy = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        e.preventDefault(); // we close it ourselves, once the parent says so
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel(); // a click on the dimmed area
      }}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-gray-700 bg-gray-900 p-0 text-gray-100 backdrop:bg-black/60"
    >
      <div className="space-y-4 p-6">
        <h2 id={titleId} className="text-lg font-semibold text-gray-50">
          {title}
        </h2>
        <p id={messageId} className="text-sm leading-relaxed text-gray-300">
          {message}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={busy} aria-busy={busy}>
            {busy ? (
              <>
                <Spinner tone="dark" /> Working…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </dialog>
  );
}