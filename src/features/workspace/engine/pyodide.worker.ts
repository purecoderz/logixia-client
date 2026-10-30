import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface;
let flag: Int32Array;
let data: Uint8Array;

async function init() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
  });

  pyodide.setStdout({
    batched: (text) => self.postMessage({ type: "stdout", text }),
  });
  pyodide.setStderr({
    batched: (text) => self.postMessage({ type: "stderr", text }),
  });

  pyodide.globals.set("_js_input", (prompt: string) => {
    Atomics.store(flag, 0, 0);
    self.postMessage({ type: "input-request", prompt });
    Atomics.wait(flag, 0, 0); // freeze here until the app sets flag > 0

    const length = Atomics.load(flag, 0) - 1; // flag = 1 + byte length
    return new TextDecoder().decode(data.slice(0, length));
  });

  pyodide.runPython(`
import builtins, sys

def _input(prompt=""):
    sys.stdout.flush()
    return _js_input(str(prompt))

builtins.input = _input
`);

  self.postMessage({ type: "ready" });
}

self.onmessage = async (e) => {
  if (e.data.type === "init") {
    flag = new Int32Array(e.data.sab, 0, 1);
    data = new Uint8Array(e.data.sab, 4);
  }

  if (e.data.type === "run") {
    try {
      const { files, entry } = e.data;
      const root = "/project";

      // wipe everything left over from earlier runs
      pyodide.FS.mkdirTree(root);
      removeTree(root);

      // forget modules imported from the old tree
      pyodide.runPython(`
import sys, importlib
for _name, _mod in list(sys.modules.items()):
    _f = getattr(_mod, "__file__", None)
    if _f and _f.startswith("/project"):
        del sys.modules[_name]
importlib.invalidate_caches()
`);

      for (const f of files) {
        const full = `${root}/${f.path}`;
        pyodide.FS.mkdirTree(full.slice(0, full.lastIndexOf("/")));
        pyodide.FS.writeFile(full, f.content);
      }

      pyodide.FS.chdir(root);
      pyodide.globals.set("_entry", `${root}/${entry}`);

      const failure = await pyodide.runPythonAsync(`
import runpy, os, sys, traceback

for _p in ("/project", os.path.dirname(_entry)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

def _report(e):
    # keep only frames that come from the user's files
    frames = [
        f for f in traceback.extract_tb(e.__traceback__)
        if f.filename.startswith("/project")
    ]
    parts = []
    if frames:
        parts.append("Traceback (most recent call last):\\n")
        parts += traceback.format_list(frames)
    parts += traceback.format_exception_only(type(e), e)
    return "".join(parts).replace("/project/", "").rstrip()

_failure = None
try:
    runpy.run_path(_entry, run_name="__main__")
except SystemExit:
    pass
except BaseException as e:
    _failure = _report(e)

_failure
`);

      if (failure) {
        self.postMessage({ type: "error", text: failure });
        return;
      }

      const before = new Map<string, string>(
        files.map((f: any) => [f.path, f.content]),
      );
      const after = readTree(root);
      const afterPaths = new Set(after.map((f) => f.path));

      const changes = after.filter((f) => before.get(f.path) !== f.content);
      const deleted = [...before.keys()].filter((p) => !afterPaths.has(p));

      self.postMessage({ type: "done", changes, deleted });
    } catch (err) {
      self.postMessage({ type: "error", text: String(err) });
    }
  }

  function readTree(
    dir: string,
    base = "",
  ): { path: string; content: string }[] {
    const result: { path: string; content: string }[] = [];
    for (const name of pyodide.FS.readdir(dir)) {
      if (name === "." || name === "..") continue;
      const full = `${dir}/${name}`;
      const rel = base ? `${base}/${name}` : name;
      const stat = pyodide.FS.stat(full);
      if (pyodide.FS.isDir(stat.mode)) {
        if (name === "__pycache__") continue;
        result.push(...readTree(full, rel));
      } else {
        result.push({
          path: rel,
          content: pyodide.FS.readFile(full, { encoding: "utf8" }),
        });
      }
    }
    return result;
  }

  function removeTree(path: string) {
    for (const name of pyodide.FS.readdir(path)) {
      if (name === "." || name === "..") continue;
      const full = `${path}/${name}`;
      const stat = pyodide.FS.stat(full);
      if (pyodide.FS.isDir(stat.mode)) {
        removeTree(full);
        pyodide.FS.rmdir(full);
      } else {
        pyodide.FS.unlink(full);
      }
    }
  }
};

init();
