import "./instructor-theme.css";
import "@/features/theme/learning-shell.css";
import { SidebarCollapseHandle } from "@/components/ui/SidebarCollapseHandle";
import { InstructorThemeProvider } from "@/features/theme/ThemeProvider";
import { useInstructorSidebarPreference } from "@/hooks/useInstructorSidebarPreference";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbProvider } from "@/components/ui/BreadCrumbs";
import { InstructorSidebar } from "./Sidebar/InstructorSidebar";
import { InstructorTopbar } from "./InstructorTopbar";
import { InstructorAssistant } from "@/features/instructorAssistant/components/InstructorAssistant";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function InstructorLayout() {
  const [drawer, setDrawer] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [collapsed, setCollapsed] = useInstructorSidebarPreference();
  const { pathname } = useLocation();
  const desktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    if (!desktop) setAssistantOpen(false);
  }, [pathname, desktop]);

  return (
    <InstructorThemeProvider>
      <BreadcrumbProvider>
        <div
          data-instructor-layout
          className="fixed inset-0 flex min-h-0 min-w-0 overflow-hidden overscroll-none bg-canvas text-body"
        >
          {/* Keep the divider toggle outside the clipped sidebar so it stays reachable. */}
          <aside
            className={`relative z-20 hidden min-h-0 shrink-0 border-r border-line transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block ${collapsed ? "w-20" : "w-72"}`}
          >
            <div
              id="instructor-desktop-sidebar"
              className="h-full w-full overflow-hidden"
            >
              <InstructorSidebar collapsed={collapsed} />
            </div>
            <SidebarCollapseHandle
              collapsed={collapsed}
              controls="instructor-desktop-sidebar"
              onToggle={() => setCollapsed((value) => !value)}
            />
          </aside>

          {/* mobile: drawer */}
          {drawer && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setDrawer(false)}
                aria-hidden
              />
              <div className="relative h-full w-72 max-w-[calc(100vw-2rem)]">
                <InstructorSidebar onClose={() => setDrawer(false)} />
              </div>
            </div>
          )}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <InstructorTopbar
              onMenu={() => setDrawer(true)}
              assistantOpen={assistantOpen}
              onAssistant={() => setAssistantOpen((open) => !open)}
            />
            <div className="flex min-h-0 min-w-0 flex-1">
              <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-none bg-canvas">
                <div className="min-w-0 w-full max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                  <Outlet />
                </div>
              </main>
              <InstructorAssistant
                pathname={pathname}
                open={assistantOpen}
                onOpenChange={setAssistantOpen}
              />
            </div>
          </div>
        </div>
      </BreadcrumbProvider>
    </InstructorThemeProvider>
  );
}
