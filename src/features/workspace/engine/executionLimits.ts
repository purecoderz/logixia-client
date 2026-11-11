export const PYTHON_EXECUTION_LIMITS = {
  timeoutMs: 10_000,
  maxOutputBytes: 100_000,
} as const;

export const pythonLimitMessage = {
  timeout: "Execution stopped after 10 seconds. Check for an infinite loop or code waiting without input.",
  output:
    "Execution stopped after producing 100 KB of output. Check for a loop that prints continuously.",
} as const;
