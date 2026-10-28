import { linter, type Diagnostic } from "@codemirror/lint";
import type { createAnalysisEngine } from "../../Workspace/engine/analysisEngine";

type AnalysisEngine = ReturnType<typeof createAnalysisEngine>;

export function pythonLinter(engine: AnalysisEngine) {
    return linter(
        async (view) => {
            const code = view.state.doc.toString();
            const problems = await engine.lint(code);

            return problems.map((p): Diagnostic => {
                const line = view.state.doc.line(Math.min(p.line, view.state.doc.lines));
                const from = Math.min(line.from + p.col, line.to);
                const to = from === line.to ? line.to : Math.min(from + 1, line.to);
                return { from, to, severity: "error", message: p.message };
            });
        },
        { delay: 400 }
    );
}