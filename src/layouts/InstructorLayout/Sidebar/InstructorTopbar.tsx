import { Bell, Menu, Search } from "lucide-react";

export function InstructorTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#30363d] bg-[#161b22] px-4 md:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="flex size-10 items-center justify-center rounded-lg text-[#c9d1d9] hover:bg-[#21262d] lg:hidden"
      >
        <Menu size={20} aria-hidden />
      </button>

      <div className="relative max-w-md flex-1">
        <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-[#30363d] bg-[#0d1117] pl-9 pr-3 text-sm text-[#c9d1d9] placeholder:text-[#8b949e] outline-none focus:border-[#58a6ff]"
        />
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="ml-auto flex size-10 items-center justify-center rounded-lg text-[#c9d1d9] hover:bg-[#21262d]"
      >
        <Bell size={20} aria-hidden />
      </button>
    </header>
  );
}