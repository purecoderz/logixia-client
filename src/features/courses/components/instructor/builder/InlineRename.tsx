import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";

interface InlineRenameProps {
  label: string; // "Module 2 title"
  value: string;
  /** Should throw when it fails, so the message can show here. */
  onSave: (title: string) => Promise<void>;
  onCancel: () => void;
}

/** A title turned into a text box. Enter saves, Escape cancels, clicking away saves. */
export function InlineRename({ label, value, onSave, onCancel }: InlineRenameProps) {
  const [title, setTitle] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const decided = useRef(false); // once Enter or Escape has decided, the blur that follows must not decide again

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  async function commit() {
    if (decided.current || saving) return;
    const clean = title.trim();
    if (clean === value.trim()) {
      decided.current = true;
      onCancel();
      return;
    }
    if (!clean) return fail("Give it a title.");
    if (clean.length > 200) return fail("Keep the title under 200 characters.");

    setSaving(true);
    setError(null);
    try {
      await onSave(clean);
      decided.current = true;
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
      fail(friendlyMessage(err, "Couldn’t rename. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  function fail(message: string) {
    setError(message);
    ref.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      decided.current = true;
      onCancel();
    }
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => void commit()}
          readOnly={saving}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "rename-error" : undefined}
          className={`${inputClass} flex-1 ${saving ? "opacity-60" : ""}`}
        />
        {saving && <Spinner />}
      </div>
      {error && (
        <p id="rename-error" role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}