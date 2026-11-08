import { useRef, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
} from "@headlessui/react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { inputClass } from "@/components/ui/formStyles";
import type { TaskInput } from "../../taskForm";
import { parseTaskJson } from "../../taskJson";

export function TaskJsonTools({
  value,
  onImport,
  hasDraft,
  disabled,
}: {
  value: TaskInput;
  onImport: (task: TaskInput) => void;
  hasDraft: boolean;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<TaskInput | null>(null);
  const [status, setStatus] = useState("");
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const readId = useRef(0);
  const json = JSON.stringify(value, null, 2);
  function apply(task: TaskInput) {
    onImport(task);
    setOpen(false);
    setPending(null);
    setStatus("JSON imported into the form. Review and save when ready.");
  }
  function load() {
    try {
      const task = parseTaskJson(source, value.type);
      setError("");
      if (hasDraft) setPending(task);
      else apply(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t read task JSON.");
    }
  }
  function close() {
    readId.current++;
    setReading(false);
    setOpen(false);
    setPending(null);
  }
  async function readFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setSource("");
      setError("Keep task JSON below 1 MB.");
      return;
    }
    const current = ++readId.current;
    setReading(true);
    setError("");
    try {
      const text = await file.text();
      if (current === readId.current) {
        setSource(text);
        setPending(null);
      }
    } catch {
      if (current === readId.current)
        setError("Couldn’t read this file. Try pasting its JSON instead.");
    } finally {
      if (current === readId.current) setReading(false);
    }
  }
  function download() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      value.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || value.type
    }-task.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            setError("");
            setStatus("");
            setPending(null);
            setOpen(true);
          }}
        >
          Import JSON
        </Button>
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(json);
              setStatus("Task JSON copied.");
            } catch {
              setStatus("Couldn’t copy JSON. Use Download JSON instead.");
            }
          }}
        >
          Copy JSON
        </Button>
        <Button variant="ghost" disabled={disabled} onClick={download}>
          Download JSON
        </Button>
      </div>
      <p role="status" className="text-right text-xs text-muted">
        {status}
      </p>
      <Dialog open={open} onClose={close} className="relative z-[80]">
        <DialogBackdrop className="fixed inset-0 bg-black/60" />
        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="w-full max-w-2xl space-y-4 rounded-xl border border-line bg-surface p-5 text-body shadow-xl">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Import {value.type === "quiz" ? "quiz" : "code task"} JSON
              </DialogTitle>
              <Description className="text-sm text-muted">
                Paste task JSON or choose a .json file. Import replaces this
                form’s content and does not save to the server.
              </Description>
              {pending ? (
                <div className="space-y-4">
                  <p className="text-sm text-body">
                    Replace the current task content with “{pending.title}”?
                    Your existing form contents will be replaced.
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" onClick={() => setPending(null)}>
                      Keep current task
                    </Button>
                    <Button onClick={() => apply(pending)}>
                      Replace form content
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    ref={fileRef}
                    aria-label="Task JSON file"
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(event) => {
                      void readFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                  <Button
                    variant="ghost"
                    disabled={reading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {reading ? "Reading file…" : "Choose JSON file"}
                  </Button>
                  <Field
                    label="Task JSON"
                    htmlFor="task-json-import"
                    error={error}
                  >
                    <textarea
                      id="task-json-import"
                      data-autofocus
                      rows={14}
                      spellCheck={false}
                      disabled={reading}
                      value={source}
                      onChange={(event) => {
                        setSource(event.target.value);
                        setError("");
                      }}
                      className={`${inputClass} font-mono text-xs`}
                      placeholder='{ "title": "...", "type": "...'
                    />
                  </Field>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={close}>
                      Cancel
                    </Button>
                    <Button disabled={reading || !source.trim()} onClick={load}>
                      Load into form
                    </Button>
                  </div>
                </>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
