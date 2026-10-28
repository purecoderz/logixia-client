import React, { useState } from 'react';
import type { SidebarProps } from './types';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { INSTRUCTOR_NAV_GROUPS } from './navData';

const DEFAULT_INSTRUCTOR = {
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@academy.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  role: 'Lead Instructor',
  academy: 'Tech Leadership Academy'
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath = 'dashboard',
  onNavigate,
  instructor = DEFAULT_INSTRUCTOR,
  collapsed: externalCollapsed,
  onToggleCollapse,
  onLogout
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    } else {
      setInternalCollapsed(nextState);
    }
  };

  return (
    <aside
      aria-label="Instructor Sidebar Navigation"
      className={`relative h-screen bg-slate-900 border-r border-slate-800/80 text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <SidebarHeader
        academyName={instructor.academy}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <SidebarNav
        groups={INSTRUCTOR_NAV_GROUPS}
        currentPath={currentPath}
        isCollapsed={isCollapsed}
        onNavigate={onNavigate}
      />

      <SidebarFooter
        instructor={instructor}
        isCollapsed={isCollapsed}
        onLogout={onLogout}
      />
    </aside>
  );
};

export default Sidebar;