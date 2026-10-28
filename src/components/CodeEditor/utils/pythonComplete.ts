import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import type { createAnalysisEngine } from "../../Workspace/engine/analysisEngine";

type AnalysisEngine = ReturnType<typeof createAnalysisEngine>;

// Jedi types -> CodeMirror icon types
const TYPE_MAP: Record<string, string> = {
    module: "namespace",
    class: "class",
    function: "function",
    instance: "variable",
    statement: "variable",
    param: "variable",
    property: "property",
    keyword: "keyword",
    path: "text",
};

export function pythonComplete(engine: AnalysisEngine) {
    const source = async (context: CompletionContext) => {
        const word = context.matchBefore(/\w*/);
        if (!word) return null;

        // only auto-open while typing a word, or right after a dot
        const afterDot = context.state.sliceDoc(word.from - 1, word.from) === ".";
        if (word.from === word.to && !context.explicit && !afterDot) return null;

        const line = context.state.doc.lineAt(context.pos);
        const items = await engine.complete(
            context.state.doc.toString(),
            line.number,
            context.pos - line.from
        );
        if (context.aborted || items.length === 0) return null;

        return {
            from: word.from,
            options: items.map((i) => ({
                label: i.name,
                type: TYPE_MAP[i.type] ?? "text",
            })),
            validFor: /^\w*$/,
        };
    };

    return autocompletion({ override: [source] });
}