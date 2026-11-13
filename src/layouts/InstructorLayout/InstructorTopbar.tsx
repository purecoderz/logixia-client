import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { TopbarBackButton, TopbarBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { Menu, Search, Sparkles } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

export function InstructorTopbar({
  onMenu,
  assistantOpen,
  onAssistant,
}: {
  onMenu: () => void;
  assistantOpen: boolean;
  onAssistant: () => void;
}) {
  return (
    <header
      data-instructor-topbar
      className="flex h-16 min-w-0 shrink-0 items-center gap-2 sm:gap-3 border-b border-line bg-surface px-4 md:px-6"
    >
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-body hover:bg-hover lg:hidden"
      >
        <Menu size={20} aria-hidden />
      </button>

      <TopbarBackButton />

      {/* takes the free space, pushes search + bell to the right */}
      <div className="min-w-0 flex-1">
        <TopbarBreadcrumbs />
      </div>

      <div className="relative hidden w-40 shrink-0 sm:block md:w-64">
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-line bg-input pl-9 pr-3 text-sm text-body placeholder:text-muted outline-none focus:border-accent"
        />
      </div>

      <ThemeToggle />

      <button
        type="button"
        onClick={onAssistant}
        aria-expanded={assistantOpen}
        aria-controls="instructor-assistant-panel"
        aria-label={assistantOpen ? "Close instructor assistant" : "Open instructor assistant"}
        className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${assistantOpen ? "bg-accent/15 text-accent" : "text-body hover:bg-hover"}`}
      >
        <Sparkles size={18} aria-hidden />
        <span className="hidden xl:inline">Ask AI</span>
      </button>

      <NotificationBell />
    </header>
  );
}
