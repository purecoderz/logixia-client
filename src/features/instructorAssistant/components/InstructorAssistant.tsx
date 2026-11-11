import { useEffect, useId, useRef, useState } from "react";
import { Eraser, Send, Sparkles, X } from "lucide-react";
import { useInstructorAssistant } from "../hooks/useInstructorAssistant";

const suggestions = [
  "Help me draft a Python task",
  "Suggest a live-session outline",
  "Create an MCQ quiz plan",
];

export function InstructorAssistant({
  pathname,
  open,
  onOpenChange,
}: {
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const inputId = useId();
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, pending, error, send, retry, clear } =
    useInstructorAssistant(pathname);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, pending, open]);

  function submit() {
    const prompt = input.trim();
    if (!prompt || pending) return;
    send(prompt);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close instructor assistant"
        onClick={() => onOpenChange(false)}
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        id="instructor-assistant-panel"
        role="dialog"
        aria-modal="false"
        aria-label="Instructor assistant"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[60] overflow-hidden bg-surface shadow-2xl transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none lg:relative lg:inset-auto lg:z-auto lg:h-full lg:shrink-0 lg:shadow-none ${open ? "pointer-events-auto translate-x-0 lg:w-96 lg:opacity-100" : "pointer-events-none translate-x-full lg:w-0 lg:translate-x-0 lg:opacity-0"}`}
      >
        <section className="flex h-full w-[min(400px,100vw)] flex-col border-l border-line bg-surface text-body lg:w-96">
          <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface-muted px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              Instructor assistant
            </h2>
            <p className="text-[11px] text-muted">Teaching and authoring help</p>
          </div>
          <button
            type="button"
            disabled={pending || messages.length === 0}
            onClick={clear}
            aria-label="Clear conversation"
            title="Clear conversation"
            className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-foreground disabled:opacity-40"
          >
            <Eraser size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close instructor assistant"
            className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-foreground"
          >
            <X size={18} aria-hidden="true" />
          </button>
          </header>

          <div
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
            aria-live="polite"
          >
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-input p-4">
                <p className="text-sm font-semibold text-foreground">
                  What are you working on?
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Ask for help planning lessons, tasks, quizzes, or live
                  sessions. Review generated content before publishing it.
                </p>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="w-full rounded-xl border border-line px-3 py-2.5 text-left text-xs text-body transition-colors hover:border-accent/50 hover:bg-accent/5 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${item.role === "user" ? "rounded-br-md bg-accent text-on-accent" : "rounded-bl-md border border-line bg-input text-body"}`}
              >
                {item.content}
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex justify-start" role="status">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-input px-4 py-3 text-muted">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
                <span className="sr-only">Assistant is responding</span>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-danger">
              <p>{error}</p>
              <button
                type="button"
                onClick={retry}
                disabled={pending}
                className="mt-2 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}
          <div ref={endRef} />
          </div>

          <form
            className="shrink-0 border-t border-line bg-surface p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
          <label htmlFor={inputId} className="sr-only">
            Message instructor assistant
          </label>
          <div className="flex items-end gap-2 rounded-xl border border-line bg-input p-2 focus-within:border-accent">
            <textarea
              id={inputId}
              rows={2}
              maxLength={4_000}
              value={input}
              disabled={pending}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask about teaching or course content…"
              className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send message"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
            >
              <Send size={17} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted">
            AI can make mistakes. Review content before publishing.
          </p>
          </form>
        </section>
      </aside>
    </>
  );
}
