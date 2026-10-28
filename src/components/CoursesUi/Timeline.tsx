import type { ReactNode } from "react";

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className = "" }: TimelineProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute bottom-6 left-4 top-6 w-px bg-[#30363d]" />
      {children}
    </div>
  );
}