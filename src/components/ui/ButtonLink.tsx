import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonLinkProps {
  to: string;
  variant?: "primary" | "ghost";
  children: ReactNode;
}

const variants = {
  primary: "bg-sky-400 text-gray-950 hover:bg-sky-300",
  ghost: "border border-gray-700 text-gray-200 hover:bg-gray-800",
};

/** A link that looks like a Button, for actions that go to another page. */
export function ButtonLink({ to, variant = "primary", children }: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}