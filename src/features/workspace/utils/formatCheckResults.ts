import type { TerminalLine } from "@/components/SmartTerminal/TerminalView";

export interface CheckResultItem {
  name: string;
  passed: boolean;
  message?: string | null;
}

export interface FormatCheckResultsOptions {
  title: string;
  passed: boolean;
  checks: CheckResultItem[];
  summaryText?: string;
}

/**
 * Format test or submission check results into terminal lines for CodeWorkspace.
 */
export function formatCheckResultsLines({
  title,
  passed,
  checks,
  summaryText,
}: FormatCheckResultsOptions): TerminalLine[] {
  const passedCount = checks.filter((check) => check.passed).length;
  const lines: TerminalLine[] = [
    { kind: "system", text: "" },
    { kind: "system", text: `─── ${title} ───` },
  ];

  for (const check of checks) {
    if (check.passed) {
      lines.push({ kind: "command", text: `  ✓ ${check.name}` });
    } else {
      lines.push({ kind: "stderr", text: `  ✗ ${check.name}` });
      if (check.message) {
        for (const msgLine of check.message.split("\n")) {
          lines.push({ kind: "stderr", text: `    ${msgLine}` });
        }
      }
    }
  }

  lines.push({
    kind: passed ? "command" : "stderr",
    text:
      summaryText ??
      (passed
        ? `Result: ${passedCount}/${checks.length} checks passed.`
        : `Result: ${passedCount}/${checks.length} checks passed — fix the failed check(s) above and try again.`),
  });

  return lines;
}
