import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";
type Size = "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-sky-400 text-gray-950 hover:bg-sky-300",
  ghost: "border border-gray-700 text-gray-200 hover:bg-gray-800",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 gap-2 px-4",
  icon: "size-11 justify-center", // icon-only: always pass aria-label
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";