import { Select } from "@/components/ui/Select";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "../../../../../components/ui/Button";
import { Spinner } from "../../../../../components/ui/Spinner";
import { inputClass } from "../../../../../components/ui/formStyles";
import { ApiError, friendlyMessage } from "../../../../../lib/apiError";

interface AddItemFormProps {
  /** Used in the button and the messages: "Add module", "Couldn’t add the lesson". */
  noun: "module" | "lesson" | "task";
  /** Shown beside the box and announced to screen readers: "Module 4", "Lesson 1.3". */
  numberLabel: string;
  existingCount: number;
  /** Must be unique on the page: several lesson forms can be on screen at once. */
  inputId: string;
  placeholder: string;
  pick?: { label: string; options: { value: string; label: string }[] };
  save: (title: string, picked: string) => Promise<{ id: number }>;
  onAdded?: (id: number) => void;
  /** Focus the box on load when there's nothing yet. Only one form on a page should do this. */
  focusWhenEmpty?: boolean;
}

const MAX_TITLE = 200;

export function AddItemForm({
  noun,
  numberLabel,
  existingCount,
  inputId,
  placeholder,
  save,
  onAdded,
  pick,
  focusWhenEmpty = false,
}: AddItemFormProps) {
  const [opened, setOpened] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [picked, setPicked] = useState(pick?.options[0]?.value ?? "");


  const isOpen = opened || existingCount === 0; // with nothing yet, the form is always shown
  const noteId = `${inputId}-note`;



  useEffect(() => {
    if (opened) inputRef.current?.focus();
  }, [opened]);

  function messageFor(err: unknown) {
    if (err instanceof ApiError && err.status === 422) return "That title isn’t valid. Check it and try again.";
    return friendlyMessage(err, `Couldn’t add the ${noun}. Please try again.`);
  }

  function fail(message: string) {
    setError(message);
    inputRef.current?.focus();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    const clean = title.trim();
    if (!clean) return fail(`Give the ${noun} a title.`);
    if (clean.length > MAX_TITLE) return fail(`Keep the title under ${MAX_TITLE} characters.`);

    setError(null);
    setAnnouncement("");
    setSaving(true);
    try {
      const created = await save(clean, picked);
      setTitle("");
      setOpened(true); // stay open so several can be typed in a row
      setAnnouncement(`${numberLabel} added`);
      onAdded?.(created.id);
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err); // a bug on our side, not a server answer
      setError(messageFor(err)); // the typed title is kept
    } finally {
      setSaving(false);
    }
    inputRef.current?.focus();
  }

  function cancel() {
    setOpened(false);
    setTitle("");
    setError(null);
    requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && existingCount > 0 && !saving) cancel();
  }

  return (
    <>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {!isOpen ? (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setOpened(true)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 text-sm font-medium text-gray-400 hover:border-gray-500 hover:text-gray-100"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Add {noun}
        </button>
      ) : (
        <form noValidate onSubmit={submit} className="rounded-xl border border-dashed border-gray-700 bg-gray-800/30 p-4">
          <label htmlFor={inputId} className="sr-only">
            {numberLabel} title
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-16 shrink-0 text-xs font-semibold text-gray-400">{numberLabel}</span>
            <input
              ref={inputRef}
              id={inputId}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={onKeyDown}
              readOnly={saving} // not disabled: a disabled input would lose focus
              autoFocus={focusWhenEmpty && existingCount === 0}
              placeholder={placeholder}
              aria-invalid={error ? true : undefined}
              aria-describedby={noteId}
              className={`${inputClass} min-w-40 flex-1 ${saving ? "opacity-60" : ""}`}
            />

            {pick && (
              <div className="min-w-40">
                <Select aria-label={pick.label} value={picked} onChange={setPicked} disabled={saving} options={pick.options} />
              </div>
            )}

            <Button type="submit" disabled={saving} aria-busy={saving}>
              {saving ? (
                <>
                  <Spinner tone="dark" /> Adding…
                </>
              ) : (
                `Add ${noun}`
              )}
            </Button>
            {existingCount > 0 && (
              <Button variant="ghost" onClick={cancel} disabled={saving}>
                Cancel
              </Button>
            )}
          </div>
          {error ? (
            <p id={noteId} role="alert" className="mt-2 text-xs text-red-400">
              {error}
            </p>
          ) : (
            <p id={noteId} className="mt-2 text-xs text-gray-400">
              Press Enter to add{existingCount > 0 ? ", Esc to cancel" : ""}.
            </p>
          )}
        </form>
      )}
    </>
  );
}