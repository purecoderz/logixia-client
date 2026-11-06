// One place for how every form control looks.
export const inputClass =
  "min-h-11 w-full rounded-lg border border-line bg-input px-3 py-2.5 text-sm text-foreground " +
  "placeholder:text-muted focus:border-accent focus:outline-none " +
  "aria-[invalid=true]:border-red-400";

// Wrapper for controls built from several parts (tags, prefixed inputs)
export const groupClass =
  "flex min-h-11 w-full items-center rounded-lg border border-line bg-input " +
  "focus-within:border-accent has-[[aria-invalid=true]]:border-red-400";
