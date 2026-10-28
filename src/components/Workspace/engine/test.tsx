import { useEffect } from "react";
import { createPythonEngine } from "./pythonEngine";
import { createAnalysisEngine } from "./analysisEngine";

export function Test() {
    // useEffect(() => {
    //     const engine = createPythonEngine((event) => {
    //         console.log("from engine:", event);

    //         if (event.type === "ready") {
    //             engine.run("print('hi')\nprint(1 + 2)");
    //         }
    //     });

    //     return () => engine.stop();
    // }, []);

    useEffect(() => {
        const analysis = createAnalysisEngine();
        analysis.ready.then(async () => {
            console.log(await analysis.lint("import os\nprint(x)\n"));
            console.log(await analysis.lint("def f(:\n"));
        });
        return () => analysis.stop();
    }, []);

    return <p>h1</p>;
}