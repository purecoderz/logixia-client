import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, fieldProps } from "@/components/ui/Field";
import { MarkdownRenderer } from "@/components/ui/Markdown";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { FormError } from "@/components/ui/FormError";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/formStyles";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import {
  emptyQuiz,
  moveItem,
  newQuestion,
  quizPayload,
  validateQuiz,
  type QuizTaskInput,
  type QuizQuestion,
  type QuizSection,
  type QuizProblem,
} from "../../quizForm";
import { TaskJsonTools } from "./TaskJsonTools";

const sections = [
  { id: "details", label: "Details" },
  { id: "questions", label: "Questions" },
  { id: "preview", label: "Preview" },
] as const;
export function QuizEditorForm({
  initial,
  editing,
  onSave,
  onCancel,
  onNew,
}: {
  initial: QuizTaskInput;
  editing: boolean;
  onSave: (quiz: QuizTaskInput) => Promise<void>;
  onCancel: () => void;
  onNew?: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [section, setSection] = useState<QuizSection>("details");
  const [problems, setProblems] = useState<QuizProblem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const running = useRef(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);
  const savedStatus = success || (editing && !dirty);
  function resetToNew() {
    const fresh = emptyQuiz();
    setValue(fresh);
    setSaved(fresh);
    setSection("details");
    setProblems([]);
    setError(null);
    setSuccess(false);
    setConfirmNew(false);
    onNew?.();
  }
  function change(patch: Partial<QuizTaskInput>) {
    setValue((current) => ({ ...current, ...patch }));
    setProblems([]);
    setError(null);
    setSuccess(false);
  }
  function question(index: number, patch: Partial<QuizQuestion>) {
    change({
      questions: value.questions.map((q, i) =>
        i === index ? { ...q, ...patch } : q,
      ),
    });
  }
  const fieldError = (field: string) =>
    problems.find((problem) => problem.field === field)?.message;
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
    const found = validateQuiz(value);
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
      const payload = quizPayload(value);
      await onSave(payload);
      setValue(payload);
      setSaved(payload);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 422
          ? "Some quiz details weren’t accepted. Review your questions and correct answers."
          : friendlyMessage(err, "Couldn’t save the quiz. Please try again."),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <TaskJsonTools
        value={quizPayload(value)}
        hasDraft={editing || dirty}
        disabled={busy}
        onImport={(task) => {
          if (task.type === "quiz") {
            setValue(task);
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
            aria-label="Quiz sections"
            className="flex flex-wrap gap-1 lg:flex-col"
          >
            {sections.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                disabled={busy}
                onClick={() => setSection(id)}
                aria-current={section === id ? "page" : undefined}
                className={`min-h-11 rounded-lg px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent ${section === id ? "bg-accent/10 font-semibold text-accent" : "text-muted hover:bg-hover"}`}
              >
                {label}
                {id === "questions" ? ` (${value.questions.length})` : ""}
              </button>
            ))}
          </nav>
          <section
            aria-labelledby="quiz-section-title"
            className="min-w-0 rounded-xl border border-line bg-surface/60"
          >
            <header className="border-b border-line px-5 py-4">
              <h2
                id="quiz-section-title"
                className="text-base font-semibold text-foreground"
              >
                {sections.find((item) => item.id === section)!.label}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Multiple-choice quiz · One correct answer per question
              </p>
            </header>
            <div className="space-y-4 p-5">
              {error && <FormError message={error} />}
              {problems.length > 0 && (
                <div
                  role="alert"
                  className="space-y-1 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-danger"
                >
                  {problems.map((problem, index) => (
                    <button
                      key={index}
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
                <legend className="sr-only">Quiz {section}</legend>
                {section === "details" && (
                  <>
                    <Field
                      label="Quiz title"
                      htmlFor="quiz-title"
                      error={fieldError("quiz-title")}
                    >
                      <input
                        {...fieldProps("quiz-title", fieldError("quiz-title"))}
                        className={inputClass}
                        value={value.title}
                        onChange={(event) =>
                          change({ title: event.target.value })
                        }
                      />
                    </Field>
                    <MarkdownEditor
                      id="quiz-instructions"
                      label="Student instructions"
                      value={value.instructions}
                      onChange={(instructions) => change({ instructions })}
                      error={fieldError("quiz-instructions")}
                    />
                  </>
                )}
                {section === "questions" && (
                  <>
                    <p className="text-sm text-muted">
                      Add at least two choices per question and select one
                      correct answer. Reordering keeps the correct answer
                      attached to its choice.
                    </p>
                    {value.questions.map((q, index) => (
                      <div
                        key={q.id}
                        className="space-y-4 rounded-lg border border-line p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            Question {index + 1}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            <Button
                              variant="ghost"
                              disabled={busy || index === 0}
                              aria-label={`Move question ${index + 1} up`}
                              onClick={() =>
                                change({
                                  questions: moveItem(
                                    value.questions,
                                    index,
                                    -1,
                                  ),
                                })
                              }
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={
                                busy || index === value.questions.length - 1
                              }
                              aria-label={`Move question ${index + 1} down`}
                              onClick={() =>
                                change({
                                  questions: moveItem(
                                    value.questions,
                                    index,
                                    1,
                                  ),
                                })
                              }
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={busy}
                              aria-label={`Remove question ${index + 1}`}
                              onClick={() =>
                                change({
                                  questions: value.questions.filter(
                                    (_, i) => i !== index,
                                  ),
                                })
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        <Field
                          label={`Question ${index + 1} text`}
                          htmlFor={`question-${index}`}
                          error={fieldError(`question-${index}`)}
                        >
                          <textarea
                            {...fieldProps(
                              `question-${index}`,
                              fieldError(`question-${index}`),
                            )}
                            rows={3}
                            className={inputClass}
                            value={q.prompt}
                            onChange={(event) =>
                              question(index, { prompt: event.target.value })
                            }
                          />
                        </Field>
                        <fieldset
                          id={`correct-${index}`}
                          tabIndex={-1}
                          className="space-y-2"
                        >
                          <legend className="mb-2 text-xs font-medium text-muted">
                            Choices — select the correct answer
                          </legend>
                          {q.choices.map((choice, ci) => (
                            <div
                              key={choice.id}
                              className="rounded-lg border border-line p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  aria-label={`Choice ${ci + 1} is correct for question ${index + 1}`}
                                  checked={q.correct_choice_id === choice.id}
                                  onChange={() =>
                                    question(index, {
                                      correct_choice_id: choice.id,
                                    })
                                  }
                                  className="accent-accent"
                                />
                                <div className="min-w-32 flex-1">
                                  <Field
                                    label={`Choice ${ci + 1}`}
                                    htmlFor={`choice-${index}-${ci}`}
                                    error={fieldError(`choice-${index}-${ci}`)}
                                  >
                                    <input
                                      {...fieldProps(
                                        `choice-${index}-${ci}`,
                                        fieldError(`choice-${index}-${ci}`),
                                      )}
                                      className={inputClass}
                                      value={choice.text}
                                      onChange={(event) =>
                                        question(index, {
                                          choices: q.choices.map((c, i) =>
                                            i === ci
                                              ? {
                                                ...c,
                                                text: event.target.value,
                                              }
                                              : c,
                                          ),
                                        })
                                      }
                                    />
                                  </Field>
                                </div>
                                <Button
                                  variant="ghost"
                                  disabled={busy || ci === 0}
                                  aria-label={`Move choice ${ci + 1} up in question ${index + 1}`}
                                  onClick={() =>
                                    question(index, {
                                      choices: moveItem(q.choices, ci, -1),
                                    })
                                  }
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  disabled={busy || ci === q.choices.length - 1}
                                  aria-label={`Move choice ${ci + 1} down in question ${index + 1}`}
                                  onClick={() =>
                                    question(index, {
                                      choices: moveItem(q.choices, ci, 1),
                                    })
                                  }
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="ghost"
                                  disabled={busy || q.choices.length <= 2}
                                  aria-label={`Remove choice ${ci + 1} from question ${index + 1}`}
                                  onClick={() =>
                                    question(index, {
                                      choices: q.choices.filter(
                                        (c) => c.id !== choice.id,
                                      ),
                                      correct_choice_id:
                                        q.correct_choice_id === choice.id
                                          ? ""
                                          : q.correct_choice_id,
                                    })
                                  }
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          ))}
                          {fieldError(`correct-${index}`) && (
                            <p role="alert" className="text-xs text-danger">
                              {fieldError(`correct-${index}`)}
                            </p>
                          )}
                        </fieldset>
                        <Button
                          variant="ghost"
                          disabled={busy}
                          onClick={() =>
                            question(index, {
                              choices: [
                                ...q.choices,
                                { id: crypto.randomUUID(), text: "" },
                              ],
                            })
                          }
                        >
                          Add choice
                        </Button>
                        <Field
                          label={`Explanation for question ${index + 1} (optional)`}
                          htmlFor={`explanation-${index}`}
                          hint="Feedback to show after grading, when permitted."
                        >
                          <textarea
                            id={`explanation-${index}`}
                            rows={2}
                            className={inputClass}
                            value={q.explanation}
                            onChange={(event) =>
                              question(index, {
                                explanation: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                    ))}
                    <Button
                      id="add-question"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        change({
                          questions: [...value.questions, newQuestion()],
                        })
                      }
                    >
                      Add question
                    </Button>
                  </>
                )}
                {section === "preview" && (
                  <>
                    <h3 className="text-xl font-semibold text-foreground">
                      {value.title || "Untitled quiz"}
                    </h3>
                    <MarkdownRenderer content={value.instructions} />
                    {value.questions.map((q, index) => (
                      <fieldset
                        key={q.id}
                        className="space-y-3 rounded-lg border border-line p-4"
                      >
                        <legend className="text-sm font-semibold text-foreground">
                          Question {index + 1}
                        </legend>
                        <MarkdownRenderer content={q.prompt || "Question text"} />
                        {q.choices.map((choice) => (
                          <label
                            key={choice.id}
                            className="flex items-start gap-3 rounded-lg bg-input p-3 text-sm text-body"
                          >
                            <input
                              type="radio"
                              name={`preview-${q.id}`}
                              className="mt-1 accent-accent"
                            />
                            {choice.text || "Choice text"}
                          </label>
                        ))}
                        <details className="text-xs text-muted">
                          <summary className="cursor-pointer">
                            Instructor answer and explanation
                          </summary>
                          <p className="mt-2">
                            Correct:{" "}
                            {q.choices.find(
                              (choice) => choice.id === q.correct_choice_id,
                            )?.text || "Not selected"}
                          </p>
                          {q.explanation && (
                            <p className="mt-1">{q.explanation}</p>
                          )}
                        </details>
                      </fieldset>
                    ))}
                    <p className="text-xs text-muted">
                      This is an instructor preview. The backend grades student
                      submissions and controls when answers and explanations are
                      revealed.
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
              ? "Quiz saved."
              : dirty
                ? "Unsaved changes"
                : editing
                  ? "All changes saved"
                  : "Complete the details and questions, then save once."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => (dirty ? setConfirmNew(true) : resetToNew())}
            >
              <Plus size={15} aria-hidden="true" />
              New quiz
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
                "Create quiz"
              )}
            </Button>
          </div>
        </footer>
      </form>
      <ConfirmDialog
        open={confirmCancel}
        title="Discard quiz changes?"
        message="Your unsaved quiz changes will be lost."
        confirmLabel="Discard changes"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={onCancel}
      />
      <ConfirmDialog
        open={confirmNew}
        title="Start a new quiz?"
        message="Your unsaved quiz changes will be lost."
        confirmLabel="Start new quiz"
        onCancel={() => setConfirmNew(false)}
        onConfirm={resetToNew}
      />
    </div>
  );
}
