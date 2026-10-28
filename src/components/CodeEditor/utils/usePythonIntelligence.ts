import { useMemo } from "react";
import type { Extension } from "@codemirror/state";
import { getAnalysisEngine } from "../../Workspace/engine/analysisEngine";
import { pythonLinter } from "./pythonLinter";
import { pythonHover } from "./pythonHover";
import type { SupportedLanguage } from "./languages";
import { pythonComplete } from "./pythonComplete";

export function usePythonIntelligence(language: SupportedLanguage): Extension[] {
    return useMemo(() => {
        if (language !== "python") return [];
        const engine = getAnalysisEngine();
        return [pythonLinter(engine), pythonHover(engine), pythonComplete(engine)];
        // autocomplete gets added here later
    }, [language]);
}



