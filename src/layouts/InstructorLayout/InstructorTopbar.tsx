import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { TopbarBreadcrumbs } from "@/components/ui/BreadCrumbs";
import { Bell, Menu, Search } from "lucide-react";

export function InstructorTopbar({ onMenu }: { onMenu: () => void }) {
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
        aria-label="Notifications"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-body hover:bg-hover"
      >
        <Bell size={20} aria-hidden />
      </button>
    </header>
  );
}
