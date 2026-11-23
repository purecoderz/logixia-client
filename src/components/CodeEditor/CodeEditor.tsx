import { githubLight } from "@uiw/codemirror-theme-github";
import { useTheme } from "../../features/theme/ThemeProvider";
import { lightEditorTheme } from "./lightEditorTheme";
// CodeEditor.tsx
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import CodeMirror, {
  ExternalChange,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { EditorView, type ViewUpdate } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { LANGUAGE_EXTENSIONS, type SupportedLanguage } from "./utils/languages";
import { usePythonIntelligence } from "./hooks/usePythonIntelligence";

export const editorTheme = EditorView.theme(
  {
    "&": { height: "100%", backgroundColor: "#1c2128" },
    ".cm-gutters": {
      backgroundColor: "#1c2128",
      color: "#6e7681",
      border: "none",
    },

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
    ".cm-scroller::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#6272a4",
    },
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
  { dark: true },
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

function computeMinimalChange(prev: string, next: string) {
  let start = 0;
  const minLen = Math.min(prev.length, next.length);
  while (start < minLen && prev.charCodeAt(start) === next.charCodeAt(start)) {
    start++;
  }
  let prevEnd = prev.length;
  let nextEnd = next.length;
  while (
    prevEnd > start &&
    nextEnd > start &&
    prev.charCodeAt(prevEnd - 1) === next.charCodeAt(nextEnd - 1)
  ) {
    prevEnd--;
    nextEnd--;
  }
  return { from: start, to: prevEnd, insert: next.slice(start, nextEnd) };
}

function lineStartOffset(text: string, lineNumber: number): number {
  if (lineNumber <= 1) return 0;
  let line = 1;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      if (line === lineNumber) return i + 1;
    }
  }
  const lastNl = text.lastIndexOf("\n");
  return lastNl === -1 ? 0 : lastNl + 1;
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
  const { theme } = useTheme();
  const currentEditorTheme = theme === "light" ? lightEditorTheme : editorTheme;
  const intelligence = usePythonIntelligence(language);

  const extensions = useMemo(
    () => [
      Prec.highest(
        isMobile ? [currentEditorTheme, mobileTheme] : currentEditorTheme,
      ),
      ...(isMobile ? [EditorView.lineWrapping] : []),
      LANGUAGE_EXTENSIONS[language],
      ...intelligence,
    ],
    [isMobile, language, intelligence, currentEditorTheme],
  );

  // Memoize basicSetup and callbacks so @uiw/react-codemirror does not
  // reconfigure all extensions (causing a visible blink) on every keystroke.
  const basicSetup = useMemo(
    () => ({
      lineNumbers: true,
      foldGutter: !isMobile,
      // CHANGED: followers see the highlight on mobile too
      highlightActiveLine: !isMobile || readOnly,
      highlightActiveLineGutter: !isMobile || readOnly,
    }),
    [isMobile, readOnly],
  );

  const cm = useRef<ReactCodeMirrorRef>(null);
  const recentEmits = useRef<Set<string>>(new Set());
  const prevFollowLine = useRef<number | null | undefined>(undefined);
  const latestRef = useRef({
    readOnly,
    isLive,
    followLine,
    onChange,
    onCursorLine,
  });
  latestRef.current = { readOnly, isLive, followLine, onChange, onCursorLine };

  const viewDoc = cm.current?.view?.state.doc.toString();
  // Ignore lagging React `value` renders that originated from our own fast typing,
  // so CodeMirror never replaces the doc and resets the cursor to line 1.
  const editorValue =
    !readOnly && viewDoc !== undefined && recentEmits.current.has(value)
      ? viewDoc
      : value;

  // Apply external document updates as a minimal diff combined with follower
  // line highlighting in a single transaction, avoiding full-doc replacement
  // flicker and 1-frame scroll/selection jumps.
  useLayoutEffect(() => {
    const view = cm.current?.view;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    const nextDoc = editorValue.replace(/\r\n?/g, "\n");
    const docChanged = nextDoc !== currentDoc;
    const lineChanged = followLine !== prevFollowLine.current;
    prevFollowLine.current = followLine;

    if (!docChanged && !(readOnly && followLine && lineChanged)) return;

    const changes = docChanged
      ? computeMinimalChange(currentDoc, nextDoc)
      : undefined;

    if (readOnly && followLine) {
      const anchor = lineStartOffset(nextDoc, followLine);
      view.dispatch({
        ...(changes ? { changes } : {}),
        selection: { anchor },
        effects: EditorView.scrollIntoView(anchor, {
          y: lineChanged ? "center" : "nearest",
        }),
        ...(docChanged ? { annotations: [ExternalChange.of(true)] } : {}),
      });
      return;
    }

    if (changes) {
      view.dispatch({
        changes,
        annotations: [ExternalChange.of(true)],
      });
    }
  }, [editorValue, followLine, readOnly]);

  const handleCreateEditor = useCallback((view: EditorView) => {
    const { readOnly: ro, followLine: targetLine } = latestRef.current;
    if (!ro || !targetLine) return;
    prevFollowLine.current = targetLine;
    const line = view.state.doc.line(
      Math.min(targetLine, view.state.doc.lines),
    );
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: "center" }),
    });
  }, []);

  const handleChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
    const { readOnly: ro, isLive: live, onChange: emit } = latestRef.current;
    if (ro) return;
    recentEmits.current.add(val);
    if (recentEmits.current.size > 30) {
      const oldest = recentEmits.current.values().next().value;
      if (oldest !== undefined) recentEmits.current.delete(oldest);
    }
    // Only compute line number if actively live streaming
    const line = live
      ? viewUpdate.state.doc.lineAt(viewUpdate.state.selection.main.head).number
      : undefined;
    emit(val, line);
  }, []);

  const handleUpdate = useCallback((update: ViewUpdate) => {
    const { readOnly: ro, onCursorLine: emitLine } = latestRef.current;
    if (!emitLine || ro) return;
    // Document changes already share their line through onChange.
    if (update.selectionSet && !update.docChanged) {
      emitLine(
        update.state.doc.lineAt(update.state.selection.main.head).number,
      );
    }
  }, []);

  return (
    <CodeMirror
      ref={cm}
      value={editorValue}
      theme={theme === "light" ? githubLight : dracula}
      className="h-full"
      readOnly={readOnly}
      editable={!(readOnly && isMobile)}
      basicSetup={basicSetup}
      extensions={extensions}
      onCreateEditor={handleCreateEditor}
      onChange={handleChange}
      onUpdate={handleUpdate}
    />
  );
}
