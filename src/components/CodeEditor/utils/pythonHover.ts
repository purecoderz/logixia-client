import { hoverTooltip } from "@codemirror/view";
import type { createAnalysisEngine } from "../../Workspace/engine/analysisEngine";

type AnalysisEngine = ReturnType<typeof createAnalysisEngine>;

export function pythonHover(engine: AnalysisEngine) {
    return hoverTooltip(
        async (view, pos) => {
            const line = view.state.doc.lineAt(pos);
            const info = await engine.hover(
                view.state.doc.toString(),
                line.number,       // 1-based
                pos - line.from    // 0-based
            );

            if (!info || !info.doc) return null;

            return {
                pos,
                above: true,
                create() {
                    const dom = document.createElement("div");
                    dom.className = "cm-python-hover";

                    const title = document.createElement("div");
                    title.className = "cm-python-hover-title";
                    title.textContent = `${info.type} ${info.name}`;

                    const body = document.createElement("pre");
                    body.className = "cm-python-hover-doc";
                    body.textContent = info.doc.slice(0, 1200);

                    dom.append(title, body);
                    return { dom };
                },
            };
        },
        { hoverTime: 350 }
    );
}