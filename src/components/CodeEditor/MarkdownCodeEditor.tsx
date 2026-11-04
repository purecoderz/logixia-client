import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { LANGUAGE_EXTENSIONS } from "./utils/languages";
// adjust to your path

const markdownTheme = EditorView.theme(
  {
    "&": { height: "100%", backgroundColor: "#0d1117", fontSize: "14px" },
    ".cm-content": { padding: "16px 0", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", lineHeight: "1.75" },
    ".cm-line": { padding: "0 16px 0 8px" },
    ".cm-gutters": { backgroundColor: "#0d1117", color: "#484f58", border: "none" },
    ".cm-activeLine": { backgroundColor: "#ffffff08" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#c9d1d9" },
    ".cm-cursor": { borderLeftColor: "#58a6ff" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "#264f78" },
    ".cm-placeholder": { color: "#6e7681" },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      overscrollBehavior: "contain",
      scrollbarWidth: "thin",
      scrollbarColor: "#44475a transparent",
    },
  },
  { dark: true },
);

// static, so it is built once
const extensions = [Prec.highest(markdownTheme), EditorView.lineWrapping, LANGUAGE_EXTENSIONS.markdown];

interface MarkdownCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Gives the parent the editor view, so toolbar buttons can edit the text. */
  onReady?: (view: EditorView) => void;
}

export function MarkdownCodeEditor({ value, onChange, placeholder, onReady }: MarkdownCodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      theme={dracula}
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