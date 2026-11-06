import { InstructorThemeProvider } from "@/features/theme/ThemeProvider";
import { useInstructorSidebarPreference } from "@/hooks/useInstructorSidebarPreference";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbProvider } from "@/components/ui/BreadCrumbs";
import { InstructorSidebar } from "./Sidebar/InstructorSidebar";
import { InstructorTopbar } from "./InstructorTopbar";

export function InstructorLayout() {
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useInstructorSidebarPreference();
  const { pathname } = useLocation();

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <InstructorThemeProvider>
    <BreadcrumbProvider>
      <div data-instructor-layout className="fixed inset-0 flex min-h-0 min-w-0 overflow-hidden overscroll-none bg-canvas text-body">
        {/* Keep the divider toggle outside the clipped sidebar so it stays reachable. */}
        <aside className={`relative z-20 hidden min-h-0 shrink-0 border-r border-line transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block ${collapsed ? "w-20" : "w-72"}`}>
          <div id="instructor-desktop-sidebar" className="h-full w-full overflow-hidden">
            <InstructorSidebar collapsed={collapsed} />
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="instructor-desktop-sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-4 top-1/2 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-10 w-5 items-center justify-center rounded-full border border-line bg-surface shadow-md transition-colors hover:border-accent/60">
              <span aria-hidden="true" className="flex h-3.5 items-stretch gap-1">
                <span className="w-px rounded-full bg-current" />
                <span className="w-px rounded-full bg-current" />
              </span>
            </span>
          </button>
        </aside>

        {/* mobile: drawer */}
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} aria-hidden />
            <div className="relative h-full w-72 max-w-[calc(100vw-2rem)]">
              <InstructorSidebar onClose={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <InstructorTopbar onMenu={() => setDrawer(true)} />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-none bg-canvas">
            <div className="min-w-0 w-full max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
    </InstructorThemeProvider>
  );
}