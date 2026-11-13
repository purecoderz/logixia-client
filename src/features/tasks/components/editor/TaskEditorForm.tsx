import { TaskJsonTools } from "./TaskJsonTools";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Files,
  ShieldCheck,
  Terminal,
  Code2,
  Eye,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, fieldProps } from "@/components/ui/Field";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { MarkdownRenderer } from "@/components/ui/Markdown";
import { FormError } from "@/components/ui/FormError";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import {
  emptyTask,
  taskPayload,
  validateTask,
  wordsFrom,
  type CodeTaskInput,
  type TaskProblem,
  type TaskSection,
  type TaskTests,
} from "../../taskForm";
import { StarterFiles } from "./StarterFiles";
import { OutputTests } from "./OutputTests";
import { TaskCodeInput } from "./TaskCodeInput";

const sections = [
  { id: "details", label: "Details", icon: FileText, title: "Task details" },
  {
    id: "files",
    label: "Starter files",
    icon: Files,
    title: "Student starter project",
  },
  {
    id: "rules",
    label: "Code rules",
    icon: ShieldCheck,
    title: "Syntax and code requirements",
  },
  {
    id: "output",
    label: "Output tests",
    icon: Terminal,
    title: "Check printed output",
  },
  {
    id: "custom",
    label: "Custom test",
    icon: Code2,
    title: "Instructor test function",
  },
  { id: "preview", label: "Preview", icon: Eye, title: "Review before saving" },
] as const;

export function TaskEditorForm({
  initial,
  editing,
  onSave,
  onCancel,
  onNew,
}: {
  initial: CodeTaskInput;
  editing: boolean;
  onSave: (task: CodeTaskInput) => Promise<void>;
  onCancel: () => void;
  onNew?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [section, setSection] = useState<TaskSection>("details");
  const [problems, setProblems] = useState<TaskProblem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const running = useRef(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const savedStatus = success || (editing && !dirty);
  const current = sections.find((item) => item.id === section)!;
  const fieldError = (id: string) =>
    problems.find((problem) => problem.field === id)?.message;
  function resetToNew() {
    const fresh = emptyTask();
    setValues(fresh);
    setSaved(fresh);
    setSection("details");
    setProblems([]);
    setError(null);
    setSuccess(false);
    setConfirmNew(false);
    onNew?.();
  }
  function change(patch: Partial<CodeTaskInput>) {
    setValues((previous) => ({ ...previous, ...patch }));
    setProblems([]);
    setError(null);
    setSuccess(false);
  }
  function tests(patch: Partial<TaskTests>) {
    change({ tests: { ...values.tests, ...patch } });
  }
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save() {
    if (running.current) return;
    const found = validateTask(values);
    setProblems(found);
    setError(null);
    setSuccess(false);
    if (found.length) {
      setSection(found[0].section);
      requestAnimationFrame(() =>
        document.getElementById(found[0].field)?.focus(),
      );
      return;
    }
    running.current = true;
    setBusy(true);
    try {
      const payload = taskPayload(values);
      await onSave(payload);
      setValues(payload);
      setSaved(payload);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 422
          ? "Some task details or tests weren’t accepted. Check your configuration and try again."
          : friendlyMessage(err, "Couldn’t save the task. Please try again."),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <TaskJsonTools
        value={taskPayload(values)}
        hasDraft={editing || dirty}
        disabled={busy}
        onImport={(task) => {
          if (task.type === "code") {
            setValues(task);
            setSection("details");
            setProblems([]);
            setError(null);
            setSuccess(false);
          }
        }}
      />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
        className="space-y-4"
      >
        <div className="grid items-start gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <nav
            aria-label="Task sections"
            className="flex flex-wrap gap-1 lg:flex-col"
          >
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                disabled={busy}
                aria-current={section === id ? "page" : undefined}
                onClick={() => setSection(id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent ${section === id ? "bg-accent/10 font-semibold text-accent" : "text-muted hover:bg-hover hover:text-foreground"}`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}{" "}
                {problems.some((problem) => problem.section === id) && (
                  <span className="text-danger" aria-label="Has errors">
                    •
                  </span>
                )}
              </button>
            ))}
          </nav>
          <section
            aria-labelledby="task-section-title"
            className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface/60"
          >
            <div className="border-b border-line px-5 py-4">
              <h2
                id="task-section-title"
                className="text-base font-semibold text-foreground"
              >
                {current.title}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Python code task · main.py entry point
              </p>
            </div>
            <div className="space-y-4 p-5">
              {error && <FormError message={error} />}
              {problems.length > 0 && (
                <div
                  role="alert"
                  className="space-y-1 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-danger"
                >
                  {problems.map((problem, i) => (
                    <button
                      key={i}
                      type="button"
                      className="block text-left underline"
                      onClick={() => {
                        setSection(problem.section);
                        requestAnimationFrame(() =>
                          document.getElementById(problem.field)?.focus(),
                        );
                      }}
                    >
                      {problem.message}
                    </button>
                  ))}
                </div>
              )}
              <fieldset disabled={busy} className="min-w-0 space-y-4">
                <legend className="sr-only">{current.title}</legend>
                {section === "details" && (
                  <>
                    <Field
                      label="Task title"
                      htmlFor="task-title"
                      error={fieldError("task-title")}
                    >
                      <input
                        {...fieldProps("task-title", fieldError("task-title"))}
                        value={values.title}
                        onChange={(event) =>
                          change({ title: event.target.value })
                        }
                        className={inputClass}
                        placeholder="For example: Build a calculator"
                      />
                    </Field>
                    <MarkdownEditor
                      id="task-instructions"
                      label="Student instructions"
                      value={values.instructions}
                      onChange={(instructions) => change({ instructions })}
                      error={fieldError("task-instructions")}
                      hint="Explain the goal, expected function names, and how the student should format their output."
                    />
                    <div className="rounded-lg border border-line bg-input p-4 text-sm text-body">
                      <p className="font-medium text-foreground">
                        Multi-file Python projects
                      </p>
                      <p className="mt-1">
                        main.py is the entry point. When custom tests import it,
                        interactive execution must stay behind the entry-point
                        guard:
                      </p>
                      <pre className="mt-3 overflow-x-auto text-xs">
                        <code>{'if __name__ == "__main__":\n    main()'}</code>
                      </pre>
                    </div>
                  </>
                )}
                {section === "files" && (
                  <StarterFiles
                    files={values.starter_files}
                    onChange={(starter_files) => change({ starter_files })}
                    disabled={busy}
                  />
                )}
                {section === "rules" && (
                  <>
                    <label className="flex items-start gap-3 text-sm text-body">
                      <input
                        type="checkbox"
                        checked={values.tests.check_syntax}
                        onChange={(event) =>
                          tests({ check_syntax: event.target.checked })
                        }
                        className="mt-1 accent-accent"
                      />
                      <span>
                        <span className="block font-medium text-foreground">
                          Check Python syntax
                        </span>
                        <span className="text-xs text-muted">
                          Validate all submitted Python files before executing
                          tests.
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 text-sm text-body">
                      <input
                        type="checkbox"
                        checked={values.tests.require_main_guard}
                        onChange={(event) =>
                          tests({ require_main_guard: event.target.checked })
                        }
                        className="mt-1 accent-accent"
                      />
                      <span>
                        <span className="block font-medium text-foreground">
                          Require the main.py entry-point guard
                        </span>
                        <span className="text-xs text-muted">
                          Require if __name__ == "__main__": so custom tests can
                          import functions without starting interactive code.
                        </span>
                      </span>
                    </label>
                    <p className="text-xs leading-relaxed text-muted">
                      Word rules match whole, case-sensitive code words across
                      Python files. Comments and string contents are ignored;
                      the original code is preserved.
                    </p>
                    <WordField
                      id="required-words"
                      label="Required words"
                      values={values.tests.required_words}
                      error={fieldError("required-words")}
                      onChange={(words) => tests({ required_words: words })}
                    />
                    <WordField
                      id="forbidden-words"
                      label="Forbidden words"
                      values={values.tests.forbidden_words}
                      error={fieldError("forbidden-words")}
                      onChange={(words) => tests({ forbidden_words: words })}
                    />
                  </>
                )}
                {section === "output" && (
                  <OutputTests
                    tests={values.tests.output_tests}
                    onChange={(output_tests) => tests({ output_tests })}
                    disabled={busy}
                  />
                )}
                {section === "custom" && (
                  <>
                    <p className="text-sm leading-relaxed text-muted">
                      Write def test_student(student): and use assertions to
                      test the submitted main.py module. Functions and variables
                      imported into main.py are available through student. Each
                      custom test run starts fresh.
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-input p-3 text-xs text-body">
                      <code>
                        {
                          'def test_student(student):\n    assert student.add(2, 3) == 5, "Check addition"'
                        }
                      </code>
                    </pre>
                    <label className="block text-sm font-medium text-foreground">
                      Custom test code (optional)
                    </label>
                    <TaskCodeInput
                      id="custom-test"
                      label="Custom test code"
                      value={values.tests.custom_test}
                      onChange={(custom_test) => tests({ custom_test })}
                      disabled={busy}
                    />
                    <p className="text-xs text-muted">
                      All assertions must pass. The backend executes these tests
                      in isolation; custom test code is never included in
                      student responses.
                    </p>
                  </>
                )}
                {section === "preview" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        {values.title || "Untitled task"}
                      </h3>
                      {values.instructions ? (
                        <MarkdownRenderer content={values.instructions}/>
                      ) : (
                        <p className="text-sm text-muted">
                          Add student instructions in Details.
                        </p>
                      )}
                      <div className="rounded-lg border border-line p-3 text-sm text-body">
                        Starter project:{" "}
                        {Object.keys(values.starter_files).join(", ")}. Entry
                        point: main.py.
                      </div>
                      {values.tests.require_main_guard && (
                        <p className="text-sm text-body">
                          Keep interactive execution inside if __name__ ==
                          "__main__":.
                        </p>
                      )}
                    </div>
                    <details className="rounded-lg border border-line p-3">
                      <summary className="cursor-pointer text-sm font-medium text-foreground">
                        Instructor configuration JSON
                      </summary>
                      <pre className="mt-3 max-h-96 overflow-auto text-xs text-body">
                        {JSON.stringify(taskPayload(values), null, 2)}
                      </pre>
                    </details>
                    <p className="text-xs text-muted">
                      This is a content preview. Student code and instructor
                      tests are validated and run by the backend after
                      submission.
                    </p>
                  </>
                )}
              </fieldset>
            </div>
          </section>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p
            role="status"
            aria-live="polite"
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${savedStatus ? "border-emerald-500/30 bg-emerald-500/10 text-success" : dirty ? "border-amber-500/30 bg-amber-500/10 text-warning" : "border-line bg-surface-muted text-muted"}`}
          >
            {savedStatus && <CheckCircle2 size={14} aria-hidden="true" />}
            {success
              ? "Task saved."
              : dirty
                ? "Unsaved changes"
                : editing
                  ? "All changes saved"
                  : "Complete the task details, then save once."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => (dirty ? setConfirmNew(true) : resetToNew())}
            >
              <Plus size={15} aria-hidden="true" />
              New task
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => (dirty ? setConfirmCancel(true) : onCancel())}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || (editing && !dirty)}
              aria-busy={busy}
            >
              {busy ? (
                <>
                  <Spinner tone="dark" /> Saving…
                </>
              ) : editing ? (
                "Save changes"
              ) : (
                "Create task"
              )}
            </Button>
          </div>
        </footer>
      </form>
      <ConfirmDialog
        open={confirmCancel}
        title="Discard task changes?"
        message="Your unsaved changes will be lost."
        confirmLabel="Discard changes"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={onCancel}
      />
      <ConfirmDialog
        open={confirmNew}
        title="Start a new task?"
        message="Your unsaved changes will be lost."
        confirmLabel="Start new task"
        onCancel={() => setConfirmNew(false)}
        onConfirm={resetToNew}
      />
    </>
  );
}

function WordField({
  id,
  label,
  values,
  onChange,
  error,
}: {
  id: string;
  label: string;
  values: string[];
  onChange: (words: string[]) => void;
  error?: string;
}) {
  const [text, setText] = useState(values.join(", "));
  return (
    <Field
      label={label}
      htmlFor={id}
      error={error}
      hint="Separate words with commas or spaces. Leave empty for no rule."
    >
      <input
        {...fieldProps(id, error, true)}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(wordsFrom(event.target.value));
        }}
        spellCheck={false}
        className={`${inputClass} font-mono`}
      />
    </Field>
  );
}
