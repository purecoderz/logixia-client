export type FormatAction = "bold" | "italic" | "code" | "codeBlock" | "heading" | "bulletList" | "numberedList" | "link";

export interface EditState {
  value: string;
  start: number; // selection start
  end: number; // selection end
}

function wrapInline(s: EditState, marker: string, placeholder: string): EditState {
  const { value, start, end } = s;
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);

  // The markers sit just outside the selection: remove them
  if (selected && before.endsWith(marker) && after.startsWith(marker)) {
    return {
      value: before.slice(0, -marker.length) + selected + after.slice(marker.length),
      start: start - marker.length,
      end: end - marker.length,
    };
  }
  // The selection itself includes the markers: remove them
  if (selected.length >= marker.length * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
    const inner = selected.slice(marker.length, -marker.length);
    return { value: before + inner + after, start, end: start + inner.length };
  }
  const text = selected || placeholder;
  return {
    value: before + marker + text + marker + after,
    start: start + marker.length,
    end: start + marker.length + text.length,
  };
}

/** The whole lines touched by the selection. */
function lineRange(value: string, start: number, end: number) {
  const from = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
  const lastChar = end > start && value[end - 1] === "\n" ? end - 1 : end; // ignore a trailing line break
  const nextBreak = value.indexOf("\n", lastChar);
  return { from, to: nextBreak === -1 ? value.length : nextBreak };
}

// `same` = the line already has THIS marker (clicking again removes it)
// `strip` = any marker of the same family, replaced instead of stacked
const PREFIX = {
  heading: { same: /^## /, strip: /^#{1,6} /, make: () => "## " },
  bulletList: { same: /^[-*] /, strip: /^([-*]|\d+\.) /, make: () => "- " },
  numberedList: { same: /^\d+\. /, strip: /^([-*]|\d+\.) /, make: (n: number) => `${n}. ` },
} as const;

function toggleLinePrefix(s: EditState, kind: keyof typeof PREFIX): EditState {
  const { value, start, end } = s;
  const { from, to } = lineRange(value, start, end);
  const lines = value.slice(from, to).split("\n");
  const { same, strip, make } = PREFIX[kind];

  const filled = lines.filter((l) => l.trim() !== "");
  if (filled.length === 0) {
    // an empty line: just start the list or heading here
    const cursor = from + make(1).length;
    return { value: value.slice(0, from) + make(1) + lines.join("\n") + value.slice(to), start: cursor, end: cursor };
  }

  const allHave = filled.every((l) => same.test(l));
  let n = 0;
  const block = lines
    .map((l) => {
      if (l.trim() === "") return l;
      if (allHave) return l.replace(strip, ""); // toggle off
      n += 1;
      return make(n) + l.replace(strip, ""); // swap another marker of the same family
    })
    .join("\n");

  return { value: value.slice(0, from) + block + value.slice(to), start: from, end: from + block.length };
}

function codeBlock(s: EditState): EditState {
  const { value, start, end } = s;
  const selected = value.slice(start, end);
  const lead = start === 0 || value[start - 1] === "\n" ? "" : "\n";
  const trail = end >= value.length || value[end] === "\n" ? "" : "\n";
  const body = selected || "code";
  const open = `${lead}\`\`\`\n`;
  const bodyStart = start + open.length;
  return {
    value: value.slice(0, start) + open + body + "\n```" + trail + value.slice(end),
    start: bodyStart,
    end: bodyStart + body.length,
  };
}

function link(s: EditState): EditState {
  const { value, start, end } = s;
  const selected = value.slice(start, end);
  const text = selected || "link text";
  const inserted = `[${text}](url)`;
  const next = value.slice(0, start) + inserted + value.slice(end);
  // with text selected, select "url" so it can be typed over; otherwise select the placeholder text
  return selected
    ? { value: next, start: start + text.length + 3, end: start + text.length + 6 }
    : { value: next, start: start + 1, end: start + 1 + text.length };
}

export function applyFormat(state: EditState, action: FormatAction): EditState {
  switch (action) {
    case "bold":
      return wrapInline(state, "**", "bold text");
    case "italic":
      return wrapInline(state, "_", "italic text");
    case "code":
      return wrapInline(state, "`", "code");
    case "codeBlock":
      return codeBlock(state);
    case "link":
      return link(state);
    default:
      return toggleLinePrefix(state, action);
  }
}
