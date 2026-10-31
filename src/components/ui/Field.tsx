import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  /** Must match the id of the control inside. */
  htmlFor: string;
  hint?: string;
  error?: string;
  /** Optional control shown on the label row, like Write/Preview tabs. */
  action?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, action, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-200">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-gray-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Spread onto the control so screen readers hear the error or hint: <input {...fieldProps("title", errors.title)} /> */
export function fieldProps(id: string, error?: string, hasHint = false) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
  } as const;
}