import type { TaskTestResult } from "../taskTest";

export function TaskTestResults({result}:{result:TaskTestResult}) {
  return <section aria-label="Task test results" className="space-y-3 rounded-lg border border-line bg-surface p-4">
    <p role="status" className={`text-sm font-semibold ${result.passed ? "text-success" : "text-danger"}`}>{result.passed ? "All checks passed." : "Some checks failed."}</p>
    <p className="text-xs text-muted">Results reflect the last test run.</p>
    <ul className="space-y-2">{result.checks.map((check,index)=><li key={index} className="text-sm"><p className={check.passed ? "text-success" : "text-danger"}>{check.passed ? "Passed" : "Failed"} · {check.name}</p>{check.message && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-muted">{check.message}</p>}</li>)}</ul>
    {result.stdout && <details><summary className="text-xs text-body">Captured output</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs text-body">{result.stdout}</pre></details>}
    {result.stderr && <details open><summary className="text-xs text-danger">Execution errors</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs text-danger">{result.stderr}</pre></details>}
  </section>;
}
