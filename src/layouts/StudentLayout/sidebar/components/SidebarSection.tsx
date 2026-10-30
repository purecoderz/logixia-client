import React from 'react';
import type { NavSection } from '../../../../StaticData/student/navConfig';
import { SidebarNavItem } from './SidebarNavItem';
import { useLocation } from 'react-router-dom';

interface SidebarSectionProps {
  section: NavSection;
  isCollapsed: boolean;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  section,
  isCollapsed,
}) => {

  const {pathname} = useLocation()

  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8b949e] mb-2">
          {section.title}
        </h3>
      )}
      {section.items.map((item) => (
        <SidebarNavItem
          key={item.id}
          isActive={pathname === item.path}
          item={item}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
};