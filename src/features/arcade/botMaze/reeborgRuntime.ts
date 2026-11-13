import type { MazeLevel, TraceFrame } from "./reeborgLevels";

export const TRACE_PREFIX = "__REEBORG_TRACE__:";

/**
 * Builds the pure-Python Reeborg simulator module injected alongside main.py.
 * Every action appends a snapshot to _trace; at exit it prints TRACE_PREFIX + JSON.
 */
export function buildReeborgRuntimePy(level: MazeLevel): string {
  const initialTokens: Record<string, number> = {};
  for (const t of level.tokens) {
    if (t.count > 0) {
      initialTokens[`${t.x},${t.y}`] = t.count;
    }
  }

  return `import json
import time

_COLS = ${level.cols}
_ROWS = ${level.rows}
_GOAL = (${level.goal.x}, ${level.goal.y})
_RIGHT_WALLS = set(${JSON.stringify(level.rightWalls)})
_TOP_WALLS = set(${JSON.stringify(level.topWalls)})
_BLOCKED_CELLS = set(${JSON.stringify(level.blockedCells ?? [])})
_MAX_STEPS = ${level.fuelLimit}
_MAX_SENSOR_CALLS = 10000
_MAX_RUN_SECONDS = 2.5
_START_TIME = time.monotonic()

_DIRS = ["E", "N", "W", "S"]
_DELTAS = {"E": (1, 0), "N": (0, 1), "W": (-1, 0), "S": (0, -1)}

_state = {
    "x": ${level.start.x},
    "y": ${level.start.y},
    "dir": ${JSON.stringify(level.start.dir)},
    "tokens": ${JSON.stringify(initialTokens)},
    "carried": 0,
    "steps": 0,
    "sensor_calls": 0,
    "stopped": False,
}

_trace = [{
    "x": _state["x"],
    "y": _state["y"],
    "dir": _state["dir"],
    "tokens": dict(_state["tokens"]),
    "carried": _state["carried"],
    "action": "start",
}]


class ReeborgError(Exception):
    pass


class ReeborgDone(Exception):
    pass


def _record(action, error=None, is_done=False):
    frame = {
        "x": _state["x"],
        "y": _state["y"],
        "dir": _state["dir"],
        "tokens": dict(_state["tokens"]),
        "carried": _state["carried"],
        "action": action,
    }
    if error:
        frame["error"] = error
    if is_done:
        frame["done"] = True
    _trace.append(frame)


def _check_loop_guard():
    _state["sensor_calls"] += 1
    if (
        _state["sensor_calls"] > _MAX_SENSOR_CALLS
        or (time.monotonic() - _START_TIME) > _MAX_RUN_SECONDS
    ):
        msg = "Infinite loop detected — robot program took too long."
        _record("timeout", error=msg)
        raise ReeborgError(msg)


def _step_tick():
    if (time.monotonic() - _START_TIME) > _MAX_RUN_SECONDS:
        msg = "Infinite loop detected — robot program took too long."
        _record("timeout", error=msg)
        raise ReeborgError(msg)
    _state["steps"] += 1
    if _state["steps"] > _MAX_STEPS:
        msg = f"Out of fuel ({_MAX_STEPS} moves) — too many moves."
        _record("limit", error=msg)
        raise ReeborgError(msg)


def _has_wall(x, y, d):
    if d == "E":
        return (
            x >= _COLS
            or f"{x},{y}" in _RIGHT_WALLS
            or f"{x + 1},{y}" in _BLOCKED_CELLS
        )
    if d == "W":
        return (
            x <= 1
            or f"{x - 1},{y}" in _RIGHT_WALLS
            or f"{x - 1},{y}" in _BLOCKED_CELLS
        )
    if d == "N":
        return (
            y >= _ROWS
            or f"{x},{y}" in _TOP_WALLS
            or f"{x},{y + 1}" in _BLOCKED_CELLS
        )
    if d == "S":
        return (
            y <= 1
            or f"{x},{y - 1}" in _TOP_WALLS
            or f"{x},{y - 1}" in _BLOCKED_CELLS
        )
    return True


def front_is_clear():
    _check_loop_guard()
    return not _has_wall(_state["x"], _state["y"], _state["dir"])


def wall_in_front():
    _check_loop_guard()
    return _has_wall(_state["x"], _state["y"], _state["dir"])


def right_is_clear():
    _check_loop_guard()
    idx = _DIRS.index(_state["dir"])
    right_dir = _DIRS[(idx - 1) % 4]
    return not _has_wall(_state["x"], _state["y"], right_dir)


def wall_on_right():
    return not right_is_clear()


def at_goal():
    _check_loop_guard()
    return (_state["x"], _state["y"]) == _GOAL


def object_here():
    _check_loop_guard()
    key = f"{_state['x']},{_state['y']}"
    return _state["tokens"].get(key, 0) > 0


def carries_object():
    _check_loop_guard()
    return _state["carried"] > 0


def is_facing_north():
    _check_loop_guard()
    return _state["dir"] == "N"


def move():
    _step_tick()
    x, y, d = _state["x"], _state["y"], _state["dir"]
    if _has_wall(x, y, d):
        msg = f"Ouch! Robot hit a wall at ({x}, {y}) facing {d}."
        _record("move", error=msg)
        raise ReeborgError(msg)
    dx, dy = _DELTAS[d]
    _state["x"] = x + dx
    _state["y"] = y + dy
    _record("move")


def turn_left():
    _step_tick()
    idx = _DIRS.index(_state["dir"])
    _state["dir"] = _DIRS[(idx + 1) % 4]
    _record("turn_left")


def take():
    _step_tick()
    key = f"{_state['x']},{_state['y']}"
    count = _state["tokens"].get(key, 0)
    if count <= 0:
        msg = f"No token here at ({_state['x']}, {_state['y']}) to take()."
        _record("take", error=msg)
        raise ReeborgError(msg)
    if count == 1:
        del _state["tokens"][key]
    else:
        _state["tokens"][key] = count - 1
    _state["carried"] += 1
    _record("take")


def put():
    _step_tick()
    if _state["carried"] <= 0:
        msg = "No token carried to put()."
        _record("put", error=msg)
        raise ReeborgError(msg)
    key = f"{_state['x']},{_state['y']}"
    _state["carried"] -= 1
    _state["tokens"][key] = _state["tokens"].get(key, 0) + 1
    _record("put")


def done():
    _record("done", is_done=True)
    raise ReeborgDone()


def _emit_trace():
    print(${JSON.stringify(TRACE_PREFIX)} + json.dumps(_trace))
`;
}

export function buildMazeRunFiles(
  level: MazeLevel,
  userCode: string,
): { path: string; content: string }[] {
  const runtimePy = buildReeborgRuntimePy(level);
  const userPy = `from reeborg_runtime import *\n${userCode}\n`;
  const mainPy = `from reeborg_runtime import ReeborgDone, ReeborgError, _emit_trace

try:
    import user_code
except ReeborgDone:
    pass
except ReeborgError:
    pass
finally:
    _emit_trace()
`;

  return [
    { path: "reeborg_runtime.py", content: runtimePy },
    { path: "user_code.py", content: userPy },
    { path: "main.py", content: mainPy },
  ];
}

export function extractTraceFromStdout(stdout: string): {
  frames: TraceFrame[] | null;
  cleanStdout: string;
} {
  const lines = stdout.split("\n");
  let frames: TraceFrame[] | null = null;
  const kept: string[] = [];

  for (const line of lines) {
    if (line.startsWith(TRACE_PREFIX)) {
      const jsonText = line.slice(TRACE_PREFIX.length);
      try {
        frames = JSON.parse(jsonText) as TraceFrame[];
      } catch {
        // Ignore malformed trace line
      }
    } else if (line.length > 0) {
      kept.push(line);
    }
  }

  return { frames, cleanStdout: kept.join("\n") };
}

export function evaluateMazeCompletion(
  level: MazeLevel,
  finalFrame: TraceFrame,
): { passed: boolean; reason?: string } {
  if (finalFrame.error) {
    return { passed: false, reason: finalFrame.error };
  }

  if (finalFrame.x !== level.goal.x || finalFrame.y !== level.goal.y) {
    return {
      passed: false,
      reason: `Robot stopped at (${finalFrame.x}, ${finalFrame.y}) instead of the goal (${level.goal.x}, ${level.goal.y}).`,
    };
  }

  if (level.requireTokensAtGoal !== undefined) {
    const atGoalCount =
      finalFrame.tokens[`${level.goal.x},${level.goal.y}`] ?? 0;
    if (atGoalCount < level.requireTokensAtGoal) {
      return {
        passed: false,
        reason: `Place ${level.requireTokensAtGoal} tokens at the goal (${atGoalCount}/${level.requireTokensAtGoal} placed).`,
      };
    }
  }

  if (level.requireAllTokensCollected) {
    const goalKey = `${level.goal.x},${level.goal.y}`;
    for (const [key, count] of Object.entries(finalFrame.tokens)) {
      if (count > 0 && (!level.requireTokensAtGoal || key !== goalKey)) {
        return {
          passed: false,
          reason: `Some tokens are still left on the grid (e.g. at (${key})).`,
        };
      }
    }
  }

  return { passed: true };
}
