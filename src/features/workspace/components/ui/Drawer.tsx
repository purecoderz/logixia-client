// components/ui/Drawer.tsx
import { useEffect, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
}

export function Drawer({ open, onClose, children, side = "left" }: DrawerProps) {
  const isLeft = side === "left";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        aria-hidden={!open}
        className={`absolute inset-y-0 w-[85%] max-w-sm border-[#30363d] bg-[#161b22] transition-transform duration-300 ease-out ${
          isLeft ? "left-0 border-r" : "right-0 border-l"
        } ${open ? "translate-x-0" : isLeft ? "-translate-x-full" : "translate-x-full"}`}
      >
        {children}
      </aside>
    </div>
  );
}