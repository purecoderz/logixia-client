import { useState, type AriaAttributes, type ReactNode } from "react";
import {
  Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Popover, PopoverButton, PopoverPanel,
  Listbox, ListboxButton, ListboxOption, ListboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps extends AriaAttributes {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  icon?: ReactNode;
  className?: string;
}

const panelClass = "z-[70] w-[var(--button-width)] min-w-48 overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] text-sm text-[#f0f6fc] shadow-xl shadow-black/30 [--anchor-gap:6px] [--anchor-padding:12px] transition duration-150 ease-out data-closed:opacity-0 motion-reduce:transition-none";
const optionClass = "group flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 outline-none data-focus:bg-sky-400/10 data-selected:bg-sky-400/15 data-disabled:pointer-events-none data-disabled:opacity-40";

/** Controlled, single-value dropdown. Use Field + fieldProps for its label, hint and error. */
export function Select({ id, name, value, onChange, options, placeholder = "Select an option", disabled = false, searchable = false, searchPlaceholder = "Search options…", emptyMessage = "No options found.", icon, className = "", ...aria }: SelectProps) {
  const chosen = options.find((option) => option.value === value);
  const triggerClass = `group flex min-h-11 w-full items-center gap-3 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2.5 text-left text-sm text-[#f0f6fc] outline-none transition-colors hover:border-gray-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/20 data-open:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-400 ${className}`;
  const content = <>
    {icon && <span className="shrink-0 text-[#8b949e]" aria-hidden="true">{icon}</span>}
    <span className={`min-w-0 flex-1 truncate ${chosen ? "" : "text-[#8b949e]"}`}>{chosen?.label ?? placeholder}</span>
    <ChevronDown aria-hidden="true" size={18} className="shrink-0 text-[#8b949e] transition-transform duration-150 group-data-open:rotate-180 group-data-open:text-sky-400 group-focus-visible:text-sky-400 motion-reduce:transition-none" />
  </>;
  const optionContent = (option: SelectOption) => <>
    <span className="min-w-0 flex-1"><span className="block break-words font-medium">{option.label}</span>{option.description && <span className="mt-0.5 block break-words text-xs text-[#8b949e]">{option.description}</span>}</span>
    <Check size={17} aria-hidden="true" className="invisible shrink-0 text-sky-400 group-data-selected:visible" />
  </>;

  if (!searchable) return (
    <Listbox value={value} onChange={onChange} name={name} disabled={disabled}>
      <ListboxButton id={id} {...aria} className={triggerClass}>{content}</ListboxButton>
      <ListboxOptions anchor="bottom start" transition className={`${panelClass} max-h-80 overflow-y-auto p-1.5`}>
        {options.map((option) => <ListboxOption key={option.value} value={option.value} disabled={option.disabled} className={optionClass}>{optionContent(option)}</ListboxOption>)}
        {options.length === 0 && <p className="px-3 py-5 text-center text-[#8b949e]">{emptyMessage}</p>}
      </ListboxOptions>
    </Listbox>
  );

  return (
    <Popover className="contents">
      {({ close }) => <>
        {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
        <PopoverButton id={id} {...aria} disabled={disabled} className={triggerClass} onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}>{content}</PopoverButton>
        <PopoverPanel anchor="bottom start" focus transition className={panelClass}>
          <SearchOptions value={value} options={options} onChange={(next) => { onChange(next); close(); }} onEscape={() => close()} searchPlaceholder={searchPlaceholder} emptyMessage={emptyMessage} renderOption={optionContent} />
        </PopoverPanel>
      </>}
    </Popover>
  );
}

function SearchOptions({ value, options, onChange, onEscape, searchPlaceholder, emptyMessage, renderOption }: {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  onEscape: () => void;
  searchPlaceholder: string;
  emptyMessage: string;
  renderOption: (option: SelectOption) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const filtered = options.filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Combobox value={value} onChange={(next) => { if (next !== null) onChange(next); }} immediate>
      <div className="p-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 focus-within:border-sky-400">
          <Search size={16} aria-hidden="true" className="shrink-0 text-[#8b949e]" />
          <ComboboxInput autoFocus aria-label={searchPlaceholder} displayValue={() => ""} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); onEscape(); } }} placeholder={searchPlaceholder} className="min-h-10 w-full bg-transparent text-sm text-[#f0f6fc] outline-none placeholder:text-[#8b949e]" />
        </div>
      </div>
      <ComboboxOptions static modal={false} className="max-h-64 overflow-y-auto px-1.5 pb-1.5" aria-label="Matching options">
        {filtered.map((option) => <ComboboxOption key={option.value} value={option.value} disabled={option.disabled} className={optionClass}>{renderOption(option)}</ComboboxOption>)}
      </ComboboxOptions>
      {filtered.length === 0 && <p role="status" className="px-3 py-5 text-center text-[#8b949e]">{emptyMessage}</p>}
      <div aria-hidden="true" className="hidden border-t border-[#30363d] px-3 py-2 text-[11px] text-[#8b949e] sm:block">↑ ↓ Navigate <span className="mx-3">↵ Select</span> Esc Close</div>
    </Combobox>
  );
}
