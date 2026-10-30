import { useMemo } from "react";
import type { Extension } from "@codemirror/state";

import { pythonLinter } from "../utils/pythonLinter";
import { pythonHover } from "../utils/pythonHover";
import type { SupportedLanguage } from "../utils/languages";
import { pythonComplete } from "../utils/pythonComplete";
import { getAnalysisEngine } from "@/features/workspace/engine/analysisEngine";

export function usePythonIntelligence(language: SupportedLanguage): Extension[] {
    return useMemo(() => {
        if (language !== "python") return [];
        const engine = getAnalysisEngine();
        return [pythonLinter(engine), pythonHover(engine), pythonComplete(engine)];
        // autocomplete gets added here later
    }, [language]);
}



