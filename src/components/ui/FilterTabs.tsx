interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: FilterTabsProps<T>) {
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
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-line text-muted hover:text-body"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
