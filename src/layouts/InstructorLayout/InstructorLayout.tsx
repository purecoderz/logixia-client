import "./instructor-theme.css";
import "./instructor-navigation.css";
import "@/features/theme/learning-shell.css";
import { SidebarCollapseHandle } from "@/components/ui/SidebarCollapseHandle";
import { InstructorThemeProvider } from "@/features/theme/ThemeProvider";
import { useInstructorSidebarPreference } from "@/hooks/useInstructorSidebarPreference";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbProvider } from "@/components/ui/BreadCrumbs";
import {
  isInstructorWorkspace,
  NAVIGATION_DURATION,
  useNavigationMotion,
} from "../navigation/NavigationMotion";
import { InstructorSidebar } from "./Sidebar/InstructorSidebar";
import { InstructorTopbar } from "./InstructorTopbar";
import { InstructorAssistant } from "@/features/instructorAssistant/components/InstructorAssistant";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function InstructorLayout({ children }: { children?: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [collapsed, setCollapsed] = useInstructorSidebarPreference();
  const { pathname, search } = useLocation();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const workspace = isInstructorWorkspace(pathname, search);
  const motion = useNavigationMotion();
  const hidden =
    motion === "instructor-exit" ||
    (workspace && motion !== "instructor-enter");
  const inactive = workspace || motion === "instructor-exit";

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    if (!desktop || workspace) setAssistantOpen(false);
  }, [pathname, desktop, workspace]);
  useEffect(() => {
    if (workspace) setDrawer(false);
  }, [workspace]);

  return (
    <InstructorThemeProvider>
      <BreadcrumbProvider>
        <div
          style={
            {
              "--navigation-duration": `${NAVIGATION_DURATION}ms`,
            } as CSSProperties
          }
          data-instructor-layout
          data-navigation-hidden={hidden}
          inert={inactive}
          aria-hidden={inactive}
          className={`fixed inset-0 flex min-h-0 min-w-0 overflow-hidden overscroll-none ${workspace ? "pointer-events-none z-60" : "bg-canvas text-body"}`}
        >
          {/* Keep the divider toggle outside the clipped sidebar so it stays reachable. */}
          <aside
            data-instructor-sidebar
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
          {drawer && !workspace && motion !== "instructor-exit" && (
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
            <div data-instructor-topbar className="shrink-0">
              <InstructorTopbar
                onMenu={() => setDrawer(true)}
                assistantOpen={assistantOpen}
                onAssistant={() => setAssistantOpen((open) => !open)}
              />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1">
              <main
                className={`min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-none ${workspace ? "invisible" : "bg-canvas"}`}
              >
                {!workspace && (
                  <div className="min-w-0 w-full max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {children ?? <Outlet />}
                  </div>
                )}
              </main>
              <InstructorAssistant
                pathname={pathname}
                open={assistantOpen}
                onOpenChange={setAssistantOpen}
              />
            </div>
          </div>
        </div>
        {workspace && (
          <div className="fixed inset-0">
            <Outlet />
          </div>
        )}
      </BreadcrumbProvider>
    </InstructorThemeProvider>
  );
}
