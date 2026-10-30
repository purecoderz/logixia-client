import React from 'react';
import type { NavItem } from '../../../../StaticData/student/navConfig';
import { Link } from 'react-router-dom';

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isCollapsed,
}) => {
  return (
    <Link
      to={item.path}
      title={isCollapsed ? item.label : undefined}
      aria-label={item.label}
      className={`group relative flex w-full items-center rounded-xl py-2.5 font-mono text-xs font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${isActive
          ? 'border border-[#30363d] bg-[#0d1117] text-white shadow-sm'
          : 'text-[#8b949e] hover:bg-[#21262d]/60 hover:text-white'
        }`}
    >
      {/* Icon + Live Pulse Indicator */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className="text-base leading-none">{item.icon}</span>
        {item.isLivePulse && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        )}
      </div>

      {/* Label & Badge */}
      {!isCollapsed && (
        <div className="flex items-center justify-between w-full min-w-0">
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-tight shrink-0 ml-2 ${item.badgeStyle || 'bg-[#30363d]/50 text-[#c9d1d9] border-[#30363d]'
                }`}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}

      {/* Collapsed Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-mono">
          {item.label}
        </div>
      )}
    </Link>
  );
};