import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { inputClass } from "@/components/ui/formStyles";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { validPythonPath } from "../../taskForm";
import { TaskCodeInput } from "./TaskCodeInput";

export function StarterFiles({
  files,
  onChange,
  disabled,
}: {
  files: Record<string, string>;
  onChange: (files: Record<string, string>) => void;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState("main.py");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const active = Object.hasOwn(files, selected)
    ? selected
    : Object.keys(files)[0];
  function add() {
    const name = filename.trim();
    if (!validPythonPath(name))
      return setError(
        "Use a relative Python path, such as helpers.py or utils/helpers.py.",
      );
    if (Object.hasOwn(files, name))
      return setError("That file already exists.");
    onChange({ ...files, [name]: "" });
    setSelected(name);
    setFilename("");
    setError("");
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Students receive these files as their starting project. main.py is
        always the entry point. Additional Python files can be imported
        normally.
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Starter files"
      >
        {Object.keys(files).map((name) => (
          <button
            key={name}
            type="button"
            disabled={disabled}
            aria-pressed={active === name}
            onClick={() => setSelected(name)}
            className={`min-h-10 max-w-full truncate rounded-lg border px-3 text-sm ${active === name ? "border-accent text-accent bg-accent/10" : "border-line text-body"}`}
          >
            {name}
          </button>
        ))}
      </div>
      {active && (
        <>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-foreground">
              {active}
            </label>
            {active !== "main.py" && (
              <Button
                variant="ghost"
                disabled={disabled}
                onClick={() => setRemoving(active)}
              >
                Remove file
              </Button>
            )}
          </div>
          <TaskCodeInput
            id="starter-code"
            label={`Starter code for ${active}`}
            value={files[active]}
            onChange={(value) => onChange({ ...files, [active]: value })}
            disabled={disabled}
          />
        </>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <Field label="New file path" htmlFor="new-task-file" error={error}>
            <input
              id="new-task-file"
              value={filename}
              disabled={disabled}
              onChange={(e) => {
                setFilename(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              className={inputClass}
              placeholder="helpers.py"
            />
          </Field>
        </div>
        <Button variant="ghost" disabled={disabled} onClick={add}>
          Add file
        </Button>
      </div>
      <ConfirmDialog
        open={removing !== null}
        title="Remove starter file?"
        message={`Remove ${removing ?? "this file"} and its starter code?`}
        confirmLabel="Remove file"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            const next = { ...files };
            delete next[removing];
            onChange(next);
            setSelected("main.py");
          }
          setRemoving(null);
        }}
      />
    </div>
  );
}
