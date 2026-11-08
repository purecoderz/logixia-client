import { EditorView } from "@codemirror/view";

/** UI chrome for light mode; syntax colours are supplied by GitHub Light. */
export const lightEditorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "var(--app-input)",
      color: "var(--app-fg)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--app-input)",
      color: "var(--app-muted)",
      border: "none",
    },
    ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "#e7f0f5" },
    ".cm-cursor": { borderLeftColor: "var(--app-fg)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--app-selection)",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      scrollbarWidth: "thin",
      scrollbarColor: "var(--app-border-strong) transparent",
      border: "2px solid var(--app-input)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--app-surface)",
      color: "var(--app-fg)",
      border: "1px solid var(--app-border)",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 8px 24px #18223018",
    },
    ".cm-python-hover": {
      maxWidth: "520px",
      maxHeight: "320px",
      overflowY: "auto",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    ".cm-python-hover-header": {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      backgroundColor: "var(--app-hover)",
      borderBottom: "1px solid var(--app-border)",
    },
    ".cm-python-hover-badge": {
      padding: "2px 6px",
      borderRadius: "4px",
      backgroundColor: "var(--app-accent)",
      color: "white",
      fontSize: "10px",
    },
    ".cm-python-hover-name": { color: "var(--app-success)", fontWeight: "600" },
    ".cm-python-hover-signature": {
      padding: "8px 12px",
      color: "var(--app-accent)",
      whiteSpace: "pre-wrap",
      fontFamily: "monospace",
    },
    ".cm-python-hover-doc": {
      padding: "8px 12px 12px",
      color: "var(--app-body)",
      whiteSpace: "pre-wrap",
      lineHeight: "1.5",
    },
    ".cm-tooltip-autocomplete": { minWidth: "180px" },
    ".cm-tooltip-autocomplete > ul": { fontSize: "12px", maxHeight: "220px" },
    ".cm-tooltip-autocomplete > ul > li": { padding: "3px 10px" },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "var(--app-hover)",
      color: "var(--app-fg)",
    },
    ".cm-completionMatchedText": {
      color: "var(--app-success)",
      fontWeight: "700",
      textDecoration: "none",
    },
  },
  { dark: false },
);
