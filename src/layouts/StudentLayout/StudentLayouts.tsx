import { Outlet } from "react-router-dom";
import { StudentSidebar } from "../sidebar/Sidebar";
import { useCallback, useState } from "react";
import { Topbar } from "../topbar/TopBar";
import { MobileSidebar } from "../sidebar/MobileSidebar";
import { BottomNav, useShowBottomNav } from "./BottomNav";

function StudentLayout() {

    const [isCollapsed, setIsCollapsed] = useState(false)


    const onToggleCollapse = () => {
        setIsCollapsed((prev) => !prev)
    }

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const closeMobile = useCallback(() => setIsMobileOpen(false), []);

    const showBottomNav = useShowBottomNav();

    return (
        <div className="flex h-screen">
            <div className="hidden md:block">
                <StudentSidebar isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
            </div>

            <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile} />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
                <main className="flex-1 overflow-y-auto bg-[#11151c] text-[#c9d1d9] ">
                    <div
                        className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${showBottomNav ? "pb-24 md:pb-8" : ""
                            }`}
                    >
                        <Outlet />
                    </div>
                </main>
            </div>

            <BottomNav onMoreClick={() => setIsMobileOpen(true)} />
        </div>
    );
}

export default StudentLayout