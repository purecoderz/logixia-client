import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface;

async function init() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
  });

  await pyodide.loadPackage(["jedi", "micropip"]);
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("pyflakes");

  pyodide.runPython(`
import jedi
from pyflakes.api import check
from pyflakes.reporter import Reporter

class _Collector(Reporter):
    def __init__(self):
        self.problems = []
    def unexpectedError(self, filename, msg):
        self.problems.append({"line": 1, "col": 0, "message": str(msg)})
    def syntaxError(self, filename, msg, lineno, offset, text):
        self.problems.append({"line": lineno or 1, "col": (offset or 1) - 1, "message": str(msg)})
    def flake(self, message):
        self.problems.append({"line": message.lineno, "col": message.col, "message": message.message % message.message_args})

def lint(code):
    c = _Collector()
    check(code, "main.py", c)
    return c.problems


def complete(code, line, col):
    try:
        comps = jedi.Script(code).complete(line, col)
    except Exception:
        return []
    return [{"name": c.name, "type": c.type} for c in comps[:80]]

def hover(code, line, col):
    try:
        names = jedi.Script(code).help(line, col)
    except Exception:
        return None
    if not names:
        return None
    n = names[0]
    return {"name": n.name, "type": n.type, "doc": n.docstring()}
`);

  self.postMessage({ type: "ready" });
}

self.onmessage = (e) => {
  if (e.data.type === "lint") {
    const lint = pyodide.globals.get("lint");
    const result = lint(e.data.code);
    const problems = result.toJs({ dict_converter: Object.fromEntries });
    result.destroy();
    self.postMessage({ type: "lint-result", id: e.data.id, problems });
  }

  if (e.data.type === "complete") {
    const complete = pyodide.globals.get("complete");
    const result = complete(e.data.code, e.data.line, e.data.col);
    const items = result.toJs({ dict_converter: Object.fromEntries });
    result.destroy();
    self.postMessage({ type: "complete-result", id: e.data.id, items });
  }

  if (e.data.type === "hover") {
    const hover = pyodide.globals.get("hover");
    const result = hover(e.data.code, e.data.line, e.data.col);
    const info = result
      ? result.toJs({ dict_converter: Object.fromEntries })
      : null;
    result?.destroy?.();
    self.postMessage({ type: "hover-result", id: e.data.id, info });
  }
};

init();
