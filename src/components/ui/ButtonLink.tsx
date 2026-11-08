import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonLinkProps {
  to: string;
  variant?: "primary" | "ghost";
  children: ReactNode;
}

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  ghost: "border border-line text-body hover:bg-surface-muted",
};

/** A link that looks like a Button, for actions that go to another page. */
export function ButtonLink({
  to,
  variant = "primary",
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}
