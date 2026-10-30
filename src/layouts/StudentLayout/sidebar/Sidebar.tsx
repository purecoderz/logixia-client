import { GUEST_NAV_SECTIONS, STUDENT_NAV_SECTIONS } from '../navConfig';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarSection } from './components/SidebarSection';
import { SidebarFooter } from './components/SidebarFooter';
import { useAuth } from '../../../features/auth/context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;

}

export const StudentSidebar = ({
  isCollapsed,
}: SidebarProps) => {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <h1>Loading</h1>
    )
  }

  const navSections = profile ? STUDENT_NAV_SECTIONS : GUEST_NAV_SECTIONS;

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#161b22] border-r border-[#30363d] text-[#c9d1d9] transition-all duration-300 select-none z-30 ${isCollapsed ? 'w-16' : 'w-64'
        }`}
    >
      <SidebarHeader isCollapsed={isCollapsed} onBrandClick={() => { }} />

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
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