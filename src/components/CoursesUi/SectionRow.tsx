import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Timeline } from "./Timeline";
import { Curve } from "../shapes/curve";


interface SectionRowProps {
  title: string;
  completed: number;
  total: number;
  duration?: string;   // was: duration: string
  defaultOpen?: boolean;
  children: ReactNode;
}

export function SectionRow({
    title,
    completed,
    total,
    duration,
    defaultOpen = false,
    children,
}: SectionRowProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="group -mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none hover:bg-[#161b22] focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
            >
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#30363d] text-[#c9d1d9]">
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span className="flex-1 truncate text-lg text-[#c9d1d9] group-hover:text-white">
                    {title}
                </span>
                <span className="text-xs text-[#8b949e]">
                    {completed} / {total}
                </span>
                <span className="rounded bg-[#21262d] px-1.5 py-0.5 text-[11px] text-[#8b949e]">
                    {duration}
                </span>
            </button>


            <div
                className={`-mt-2 grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="relative pb-4 pt-4">
                        <Curve />
                        <Timeline className="ml-8">{children}</Timeline>
                        <Curve flip />
                    </div>
                </div>
            </div>
        </div>
    );
}