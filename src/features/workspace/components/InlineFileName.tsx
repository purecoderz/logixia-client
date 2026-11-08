import { useEffect, useId, useRef, useState } from "react";

interface InlineFileNameProps {
  name: string;
  action?: "rename" | "create";
  type: "file" | "folder";
  validate: (name: string) => string | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function InlineFileName({
  name,
  type,
  action = "rename",
  validate,
  onSave,
  onCancel,
}: InlineFileNameProps) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const errorId = useId();
  useEffect(() => {
    const input = ref.current;
    input?.focus();
    const extension = name.lastIndexOf(".");
    input?.setSelectionRange(
      0,
      type === "file" && extension > 0 ? extension : name.length,
    );
  }, [name, type]);

  function save() {
    const next = value.trim();
    const problem = !next
      ? "Name is required"
      : /[\\/]/.test(next) || next === "." || next === ".."
        ? "Use a name without path separators"
        : validate(next);
    if (problem) {
      setError(problem);
      return;
    }
    if (next !== name) onSave(next);
    else onCancel();
  }

  return (
    <span
      className="relative min-w-0 flex-1"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <input
        ref={ref}
        aria-label={`${action === "create" ? "New" : "Rename"} ${type}`}
        placeholder={action === "create" ? `${type} name` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
        onBlur={onCancel}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            save();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        className={`h-6 w-full rounded-sm border bg-input px-1 text-sm text-foreground outline-none ${error ? "border-danger" : "border-accent"}`}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          className="absolute left-0 top-full z-30 min-w-48 rounded border border-danger bg-surface p-2 text-xs text-danger shadow-lg"
        >
          {error}
        </span>
      )}
    </span>
  );
}
