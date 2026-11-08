import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { useTheme } from "@/features/theme/ThemeProvider";

/** Authoring only: code is sent to the backend and never executed by this control. */
export function TaskCodeInput({
  id,
  label,
  value,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const extensions = useMemo(() => [python()], []);
  return (
    <div
      id={id}
      tabIndex={-1}
      className="overflow-hidden rounded-lg border border-line focus-within:border-accent"
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={theme === "light" ? githubLight : githubDark}
        extensions={extensions}
        height="320px"
        readOnly={disabled}
        aria-label={label}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
}
