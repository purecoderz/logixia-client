import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

export interface MenuItem {
  label: string;
  onSelect: () => void;
}

interface ActionMenuProps {
  /** Names the button for screen readers, e.g. "More actions for Python Basics". */
  id?: string;
  label: string;
  items: MenuItem[];
  disabled?: boolean;
}

type Position = { right: number; top?: number; bottom?: number };

/**
 * The "three dots" menu. The list is drawn on the page itself (a portal), so a table that
 * scrolls sideways can't clip it, and it flips upward near the bottom of the screen.
 */
export function ActionMenu({id, label, items, disabled }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function openMenu() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const height = items.length * 44 + 8;
    const flipUp = window.innerHeight - r.bottom < height + 8 && r.top > height + 8;
    setPosition({
      right: Math.max(8, window.innerWidth - r.right),
      ...(flipUp ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
    });
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  // focus the first item when it opens
  useEffect(() => {
    if (open) menuItems()[0]?.focus();
  }, [open]);

  // click elsewhere, scrolling or resizing closes it
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", away);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      document.removeEventListener("mousedown", away);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [open]);

  function onTriggerKeyDown(e: KeyboardEvent) {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      e.preventDefault();
      openMenu();
    }
  }

  function onMenuKeyDown(e: KeyboardEvent) {
    const list = menuItems();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => {
      e.preventDefault();
      list[(i + list.length) % list.length]?.focus();
    };
    if (e.key === "ArrowDown") go(index + 1);
    else if (e.key === "ArrowUp") go(index - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") close(false);
  }

  return (
    <>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => (open ? close(true) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-body hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            style={{ position: "fixed", ...position }}
            onKeyDown={onMenuKeyDown}
            className="z-50 min-w-48 rounded-xl border border-line bg-input p-1 shadow-xl"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close(true);
                  item.onSelect();
                }}
                className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-foreground hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}