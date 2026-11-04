import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbProvider } from "@/components/ui/BreadCrumbs";
import { InstructorSidebar } from "./Sidebar/InstructorSidebar";
import { InstructorTopbar } from "./InstructorTopbar";

export function InstructorLayout() {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen bg-[#11151c] text-[#c9d1d9]">
        {/* desktop: fixed sidebar */}
        <aside className="hidden shrink-0 lg:block">
          <InstructorSidebar />
        </aside>

        {/* mobile: drawer */}
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} aria-hidden />
            <div className="relative h-full w-72">
              <InstructorSidebar onClose={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <InstructorTopbar onMenu={() => setDrawer(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}