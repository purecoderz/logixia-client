import { useState, type KeyboardEvent } from "react";
import { groupClass } from "./formStyles";

interface TagInputProps {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({ id, value, onChange, placeholder, maxTags = 20 }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tag = raw.trim();
    if (!tag || value.length >= maxTags) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return; // no duplicates
    onChange([...value, tag]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Enter must not submit a surrounding form
      add(draft);
      setDraft("");
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={`${groupClass} flex-wrap gap-2 p-2`}>
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-gray-800 py-1 pr-1 pl-2.5 text-sm text-gray-200">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="inline-flex size-6 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-gray-50"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          add(draft); // don't lose a half-finished tag
          setDraft("");
        }}
        placeholder={placeholder}
        className="min-w-36 flex-1 bg-transparent px-1 py-1 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
      />
    </div>
  );
}
