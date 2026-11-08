import "@/features/theme/learning-shell.css";
import { SidebarCollapseHandle } from "@/components/ui/SidebarCollapseHandle";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { Outlet, useLocation } from "react-router-dom";
import { StudentSidebar } from "./sidebar/Sidebar";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { MobileSidebar } from "./sidebar/MobileSidebar";
import { BottomNav, useShowBottomNav } from "./BottomNav";
import { Topbar } from "./topbar/TopBar";
import {
  NAVIGATION_DURATION,
  useNavigationMotion,
} from "../navigation/NavigationMotion";
import "./student-navigation.css";
import "./student-theme.css";

function StudentLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const showBottomNav = useShowBottomNav();
  const { pathname } = useLocation();
  const workspace = pathname === "/playground";
  const motion = useNavigationMotion();
  const hidden =
    motion === "student-exit" || (workspace && motion !== "student-enter");
  const inactive = workspace || motion === "student-exit";
  useEffect(() => {
    if (workspace) setIsMobileOpen(false);
  }, [workspace]);

  return (
    <ThemeProvider>
      {/* The same navigation stays mounted across the dashboard/playground route. */}
      <div
        style={
          {
            "--navigation-duration": `${NAVIGATION_DURATION}ms`,
          } as CSSProperties
        }
        data-student-shell
        data-navigation-hidden={hidden}
        data-navigation-motion={motion}
        inert={inactive}
        aria-hidden={inactive}
        className={`flex h-dvh overflow-hidden ${workspace ? "pointer-events-none fixed inset-0 z-60" : "relative"}`}
      >
        <div
          data-student-sidebar
          className="relative z-40 hidden shrink-0 md:block"
        >
          <div id="student-desktop-sidebar" className="h-full">
            <StudentSidebar isCollapsed={isCollapsed} />
          </div>
          <SidebarCollapseHandle
            collapsed={isCollapsed}
            controls="student-desktop-sidebar"
            onToggle={() => setIsCollapsed((value) => !value)}
          />
        </div>
        {!workspace && motion !== "student-exit" && (
          <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile} />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div data-student-topbar className="shrink-0">
            <Topbar />
          </div>
          <main
            data-student-content
            className={`min-h-0 flex-1 overflow-y-auto ${workspace ? "invisible" : "bg-canvas text-body"}`}
          >
            {!workspace && (
              <div
                className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${showBottomNav ? "pb-24 md:pb-8" : ""}`}
              >
                <Outlet />
              </div>
            )}
          </main>
        </div>
        <BottomNav
          forceVisible={workspace}
          onMoreClick={() => setIsMobileOpen(true)}
        />
      </div>
      {workspace && (
        <div className="fixed inset-0">
          <Outlet />
        </div>
      )}
    </ThemeProvider>
  );
}

export default StudentLayout;
