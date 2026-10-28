// components/Workspace/LiveEditor.tsx
import { CodeEditor } from "./CodeEditor";
import type { SupportedLanguage } from "./utils/languages";

interface LiveEditorProps {
    value: string;
    onChange: (value: string, line?:number) => void; 
    language: SupportedLanguage;
    readOnly?: boolean;
    isMobile: boolean;
    followLine?: number | null
    onCursorLine?: (line: number) => void;
}

export function LiveEditor({ value, onChange, language, readOnly = false, isMobile, followLine, onCursorLine }: LiveEditorProps) {
    return (
        <CodeEditor
            isLive
            value={value}
            onChange={(text, line) => {
                if (!readOnly) onChange(text, line);
            }}
            language={language}
            readOnly={readOnly}
            isMobile={isMobile}
            followLine={followLine}
            onCursorLine={onCursorLine}
        />
    );
}