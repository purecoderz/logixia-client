import type { FormatAction } from "@/lib/markdownFormat";
import type { ReactNode } from "react";

const icon = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

interface ToolbarButton {
  action: FormatAction;
  label: string;
  shortcut?: string;
  content: ReactNode;
}

// Grouped so a divider can sit between them
const groups: ToolbarButton[][] = [
  [
    { action: "heading", label: "Heading", content: <span className="text-sm font-bold">H</span> },
    { action: "bold", label: "Bold", shortcut: "Ctrl+B", content: <span className="text-sm font-bold">B</span> },
    { action: "italic", label: "Italic", shortcut: "Ctrl+I", content: <span className="text-sm font-semibold italic">I</span> },
  ],
  [
    { action: "bulletList", label: "Bulleted list", content: icon("M6 4h8M6 8h8M6 12h8M2.5 4h.1M2.5 8h.1M2.5 12h.1") },
    { action: "numberedList", label: "Numbered list", content: icon("M7 4h7M7 8h7M7 12h7M2.5 3v3M2.5 11.5h2M2.5 9.5h2l-2 2") },
  ],
  [
    { action: "link", label: "Link", shortcut: "Ctrl+K", content: icon("M6.5 9.5l3-3M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 0 1 4.5 9l1-1") },
    { action: "code", label: "Inline code", content: icon("M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5") },
    { action: "codeBlock", label: "Code block", content: icon("M2.5 3.5h11v9h-11zM5 6.5l1.5 1.5L5 9.5M8 9.5h3") },
  ],
];

interface MarkdownToolbarProps {
  onAction: (action: FormatAction) => void;
}

export function MarkdownToolbar({ onAction }: MarkdownToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex min-w-0 items-center gap-0.5 overflow-x-auto"
    >
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <span aria-hidden="true" className="mx-1.5 h-4 w-px bg-[#30363d]" />}
          {group.map((b) => (
            <button
              key={b.action}
              type="button"
              aria-label={b.label}
              title={b.shortcut ? `${b.label} (${b.shortcut})` : b.label}
              // keep the text selected: a click would otherwise move focus out of the editor
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onAction(b.action)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-[#21262d] hover:text-gray-50 sm:size-8"
            >
              {b.content}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}