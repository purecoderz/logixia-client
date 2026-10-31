import type { InputHTMLAttributes } from "react";
import { groupClass } from "./formStyles";

interface PrefixInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Text shown before the value, like "₦" or "/courses/". */
  leading: string;
}

export function PrefixInput({ leading, ...props }: PrefixInputProps) {
  return (
    <div className={groupClass}>
      <span className="pl-3 text-sm text-gray-400" aria-hidden="true">
        {leading}
      </span>
      <input
        {...props}
        className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 pl-1 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
      />
    </div>
  );
}
