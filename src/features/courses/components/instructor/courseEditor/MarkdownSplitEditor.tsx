import { useDeferredValue, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { EditorView } from "@codemirror/view";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { applyFormat, type FormatAction } from "@/lib/markdownFormat";
import { Markdown } from "@/components/ui/Markdown";
import { MarkdownCodeEditor } from "@/components/CodeEditor/MarkdownCodeEditor";
// adjust to your path

interface MarkdownSplitEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

type Mode = "split" | "write" | "preview";

/** One workspace: toolbar on top, writing and preview side by side, status bar below. */
export function MarkdownSplitEditor({ label, value, onChange }: MarkdownSplitEditorProps) {
  const [mode, setMode] = useState<Mode>("write");
  const viewRef = useRef<EditorView | null>(null);

  // The preview may trail a little behind fast typing, so typing never waits for it
  const previewValue = useDeferredValue(value);

  function run(action: FormatAction) {
    const view = viewRef.current;
    if (!view || mode === "preview") return; // the editor is hidden in Preview, so nothing to format
    const { from, to } = view.state.selection.main;
    const next = applyFormat({ value: view.state.doc.toString(), start: from, end: to }, action);

    // text and selection change in one step, so no pending-selection ref is needed
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: next.value },
      selection: { anchor: next.start, head: next.end },
    });
    view.focus();
  }

  // capture phase, so CodeMirror's own key handling doesn't swallow Ctrl+B / I / K
  function onKeyDownCapture(e: KeyboardEvent<HTMLDivElement>) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const shortcut: Record<string, FormatAction> = { b: "bold", i: "italic", k: "link" };
    const action = shortcut[e.key.toLowerCase()];
    if (!action) return;
    e.preventDefault();
    e.stopPropagation();
    run(action);
  }

  const words = useMemo(() => (value.trim() ? value.trim().split(/\s+/).length : 0), [value]);

  const base = "min-h-9 rounded-md px-2.5 text-xs font-medium";
  const on = "bg-hover text-foreground";
  const off = "text-muted hover:text-body";

  // On narrow screens "split" shows only the writing side, so Write looks selected there
  const writeClass =
    mode === "write" ? on : mode === "split" ? `${off} max-lg:bg-hover max-lg:text-foreground` : off;

  const showWrite = mode !== "preview";
  const showPreview = mode !== "write";

  return (
    <div className="flex h-[70dvh] min-h-[24rem] flex-col overflow-hidden rounded-xl border border-line bg-input lg:h-[calc(100dvh-20rem)]">
      {/* toolbar + view toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface px-2 py-1">
        {/* `inert` takes the buttons out of the tab order as well, not just out of reach of the mouse */}
        <div inert={mode === "preview"} className={mode === "preview" ? "opacity-40" : ""}>
          <MarkdownToolbar onAction={run} />
        </div>

        <div role="tablist" aria-label="Editor view" className="flex shrink-0 gap-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "split"}
            onClick={() => setMode("split")}
            className={`${base} hidden lg:block ${mode === "split" ? on : off}`}
          >
            Split
          </button>
          <button type="button" role="tab" aria-selected={mode === "write"} onClick={() => setMode("write")} className={`${base} ${writeClass}`}>
            Write
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            onClick={() => setMode("preview")}
            className={`${base} ${mode === "preview" ? on : off}`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* panes: one grid, one hairline between them. Each side scrolls on its own. */}
      <div className={`grid min-h-0 flex-1 grid-rows-1 ${mode === "split" ? "lg:grid-cols-2" : ""}`}>
        <div
          role="group"
          aria-label={label}
          className={`${showWrite ? "block" : "hidden"} h-full min-h-0 overflow-hidden bg-input`}
          onKeyDownCapture={onKeyDownCapture}
        >
          <MarkdownCodeEditor
            value={value}
            onChange={(v) => onChange(v)}
            placeholder="Write the lesson here. Use the buttons above, or Markdown."
            onReady={(view) => (viewRef.current = view)}
          />
        </div>

        <div
          role="region"
          aria-label="Preview"
          className={`${showPreview ? "block" : "hidden"} ${
            mode === "split" ? "max-lg:hidden lg:border-l lg:border-line" : ""
          } min-h-0 overflow-auto bg-input p-5`}
        >
          {/* only built while it can be seen */}
          {showPreview &&
            (previewValue.trim() ? (
              <Markdown>{previewValue}</Markdown>
            ) : (
              <p className="text-sm text-muted">Nothing to preview yet.</p>
            ))}
        </div>
      </div>

      {/* status bar */}
      <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-1.5 text-xs text-muted">
        <span>Markdown</span>
        <span>
          {words} {words === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}