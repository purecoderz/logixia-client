import { GUEST_NAV_SECTIONS, STUDENT_NAV_SECTIONS } from "../navConfig";
import { SidebarHeader } from "./components/SidebarHeader";
import { SidebarSection } from "./components/SidebarSection";
import { SidebarFooter } from "./components/SidebarFooter";
import { useAuth } from "../../../features/auth/context/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
}

export const StudentSidebar = ({ isCollapsed }: SidebarProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  const navSections = profile ? STUDENT_NAV_SECTIONS : GUEST_NAV_SECTIONS;

  return (
    <aside
      className={`relative flex min-h-0 flex-col h-dvh bg-surface border-r border-line text-body transition-[width] duration-300 motion-reduce:transition-none select-none z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <SidebarHeader isCollapsed={isCollapsed} onBrandClick={() => {}} />

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navSections.map((section, idx) => (
          <SidebarSection
            key={idx}
            section={section}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <SidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
};
