import { useMemo } from "react";
import { githubLight } from "@uiw/codemirror-theme-github";
import { useTheme } from "@/features/theme/ThemeProvider";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { LANGUAGE_EXTENSIONS } from "./utils/languages";
// adjust to your path

const markdownTheme = (dark: boolean) =>
  EditorView.theme(
    {
      "&": {
        height: "100%",
        backgroundColor: "var(--app-input)",
        fontSize: "14px",
      },
      ".cm-content": {
        padding: "16px 0",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        lineHeight: "1.75",
      },
      ".cm-line": { padding: "0 16px 0 8px" },
      ".cm-gutters": {
        backgroundColor: "var(--app-input)",
        color: "var(--app-muted)",
        border: "none",
      },
      ".cm-activeLine": { backgroundColor: "var(--app-hover)" },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "var(--app-body)",
      },
      ".cm-cursor": { borderLeftColor: "var(--app-accent)" },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
        backgroundColor: "var(--app-selection)",
      },
      ".cm-placeholder": { color: "var(--app-muted)" },
      "&.cm-focused": { outline: "none" },
      ".cm-scroller": {
        overscrollBehavior: "contain",
        scrollbarWidth: "thin",
        scrollbarColor: "var(--app-border) transparent",
      },
    },
    { dark },
  );

interface MarkdownCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Gives the parent the editor view, so toolbar buttons can edit the text. */
  onReady?: (view: EditorView) => void;
}

export function MarkdownCodeEditor({
  value,
  onChange,
  placeholder,
  onReady,
}: MarkdownCodeEditorProps) {
  const { theme } = useTheme();
  const extensions = useMemo(
    () => [
      Prec.highest(markdownTheme(theme === "dark")),
      EditorView.lineWrapping,
      LANGUAGE_EXTENSIONS.markdown,
    ],
    [theme],
  );
  return (
    <CodeMirror
      value={value}
      theme={theme === "light" ? githubLight : dracula}
      className="h-full"
      placeholder={placeholder}
      extensions={extensions}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
      }}
      onChange={(val) => onChange(val)}
      onCreateEditor={(view) => onReady?.(view)}
    />
  );
}
