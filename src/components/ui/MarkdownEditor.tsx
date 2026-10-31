import { useState } from "react";
import { Field, fieldProps } from "./Field";
import { inputClass } from "./formStyles";
import { Markdown } from "./Markdown";

interface MarkdownEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  error?: string;
  allowImages?: boolean;
}

type Mode = "write" | "preview";

export function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  rows = 6,
  hint,
  error,
  allowImages = false,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>("write");

  const tab = (m: Mode, text: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => setMode(m)}
      className={`min-h-11 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
        mode === m ? "bg-gray-800 text-gray-50" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {text}
    </button>
  );

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      action={
        <div role="tablist" aria-label={`${label} mode`} className="flex gap-1">
          {tab("write", "Write")}
          {tab("preview", "Preview")}
        </div>
      }
    >
      {/* Stays mounted while previewing so nothing typed is lost */}
      <textarea
        {...fieldProps(id, error, Boolean(hint))}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={mode === "write" ? `${inputClass} resize-y leading-6` : "hidden"}
      />
      {mode === "preview" && (
        <div role="tabpanel" className="min-h-32 rounded-lg border border-gray-700 bg-gray-900 p-3">
          {value.trim() ? (
            <Markdown allowImages={allowImages}>{value}</Markdown>
          ) : (
            <p className="text-sm text-gray-500">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </Field>
  );
}