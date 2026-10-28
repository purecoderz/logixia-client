interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({ options, value, onChange }: FilterTabsProps<T>) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active
                ? "border-[#58a6ff]/50 bg-[#58a6ff]/15 text-[#58a6ff]"
                : "border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}