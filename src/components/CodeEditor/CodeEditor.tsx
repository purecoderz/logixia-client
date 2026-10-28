// CodeEditor.tsx
import { useEffect, useMemo, useRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { LANGUAGE_EXTENSIONS, type SupportedLanguage } from "./utils/languages";
import { usePythonIntelligence } from "./utils/usePythonIntelligence";

export const editorTheme = EditorView.theme(
  {
    "&": { height: "100%", backgroundColor: "#1c2128" },
    ".cm-gutters": { backgroundColor: "#1c2128", color: "#6e7681", border: "none" },

    // CHANGED: stronger current-line highlight
    ".cm-activeLine": { backgroundColor: "#bd93f933" },
    ".cm-activeLineGutter": { backgroundColor: "#bd93f933", color: "#f8f8f2" },
    ".cm-cursor": { borderLeftColor: "#f8f8f2" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "#264f78",
    },
    "&.cm-focused": { outline: "none" },

    // scrollbar
    ".cm-scroller": {
      scrollbarWidth: "thin",
      scrollbarColor: "#44475a transparent",
      border: "2px solid #1c2128",
    },
    ".cm-scroller::-webkit-scrollbar": { width: "10px", height: "10px" },
    ".cm-scroller::-webkit-scrollbar-track": { background: "transparent" },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      backgroundColor: "#44475a",
      borderRadius: "6px",
      border: "2px solid #1e1e1e",
    },
    ".cm-scroller::-webkit-scrollbar-thumb:hover": { backgroundColor: "#6272a4" },
    ".cm-scroller::-webkit-scrollbar-corner": { background: "transparent" },

    // hover tooltip
    ".cm-tooltip": {
      backgroundColor: "#252526",
      border: "1px solid #6272a4",
      borderRadius: "10px",
      color: "#f8f8f2",
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      overflow: "hidden",
    },
    ".cm-python-hover": {
      maxWidth: "520px",
      maxHeight: "320px",
      overflowY: "auto",
      padding: "0",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    ".cm-python-hover-header": {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      backgroundColor: "#1c2128",
      borderBottom: "1px solid #44475a",
    },
    ".cm-python-hover-badge": {
      fontSize: "10px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "2px 6px",
      borderRadius: "4px",
      backgroundColor: "#bd93f9",
      color: "#1e1e1e",
      fontWeight: "700",
    },
    ".cm-python-hover-name": {
      color: "#50fa7b",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "13px",
      fontWeight: "600",
    },
    ".cm-python-hover-signature": {
      margin: "0",
      padding: "8px 12px",
      color: "#8be9fd",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "12px",
      whiteSpace: "pre-wrap",
    },
    ".cm-python-hover-doc": {
      padding: "8px 12px 12px",
      color: "#f8f8f2cc",
      fontSize: "12px",
      lineHeight: "1.5",
      whiteSpace: "pre-wrap",
      borderTop: "1px solid #44475a",
    },

    // autocomplete popup
    ".cm-tooltip-autocomplete": {
      minWidth: "180px",
    },
    ".cm-tooltip-autocomplete > ul": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "12px",
      maxHeight: "220px",
    },
    ".cm-tooltip-autocomplete > ul > li": {
      padding: "3px 10px",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "#44475a",
      color: "#f8f8f2",
    },
    ".cm-completionMatchedText": {
      color: "#50fa7b",
      textDecoration: "none",
      fontWeight: "700",
    },
  },
  { dark: true }
);

// moved here from CodeEditorMobile
const mobileTheme = EditorView.theme({
  "&": { fontSize: "16px" },
  ".cm-content": { padding: "8px 0" },
  ".cm-scroller": { overscrollBehavior: "contain" },
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string, line?: number) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  isMobile?: boolean;
  onCursorLine?: (line: number) => void;
  followLine?: number | null;
  isLive?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  isMobile = false,
  onCursorLine,
  followLine,
  isLive = false,
}: CodeEditorProps) {
  const intelligence = usePythonIntelligence(language);

  const extensions = useMemo(
    () => [
      Prec.highest(isMobile ? [editorTheme, mobileTheme] : editorTheme),
      ...(isMobile ? [EditorView.lineWrapping] : []),
      LANGUAGE_EXTENSIONS[language],
      ...intelligence,
    ],
    [isMobile, language, intelligence],
  );

  const cm = useRef<ReactCodeMirrorRef>(null);

  // Followers: move the cursor to the instructor's line and scroll to it.
  // Re-runs on `value` too, so it still works when the document updates.
  useEffect(() => {
    if (!readOnly || !followLine) return;
    const view = cm.current?.view;
    if (!view) return;

    const id = requestAnimationFrame(() => {
      const total = view.state.doc.lines;
      const line = view.state.doc.line(Math.min(followLine, total));
      view.dispatch({
        selection: { anchor: line.from }, // active line highlight follows the cursor
        effects: EditorView.scrollIntoView(line.from, { y: "center" }),
      });
    });

    return () => cancelAnimationFrame(id);
  }, [followLine, value, readOnly]);

  return (
    <CodeMirror
      ref={cm}
      value={value}
      theme={dracula}
      className="h-full"
      readOnly={readOnly}
      editable={!(readOnly && isMobile)}
      basicSetup={{
        lineNumbers: true,
        foldGutter: !isMobile,
        // CHANGED: followers see the highlight on mobile too
        highlightActiveLine: !isMobile || readOnly,
        highlightActiveLineGutter: !isMobile || readOnly,
      }}
      extensions={extensions}
      onChange={(val, viewUpdate) => {
        if (readOnly) return;
        // Only compute line number if actively live streaming
        const line = isLive
          ? viewUpdate.state.doc.lineAt(viewUpdate.state.selection.main.head).number
          : undefined;
        onChange(val, line);
      }}
      onUpdate={(update) => {
        if (!onCursorLine || readOnly) return;
        if (update.docChanged || update.selectionSet) {
          onCursorLine(update.state.doc.lineAt(update.state.selection.main.head).number);
        }
      }}
    />
  );
}