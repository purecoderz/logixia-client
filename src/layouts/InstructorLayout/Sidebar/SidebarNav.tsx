import React, { useState } from 'react';
import type { NavGroup, NavItem } from './types';

interface SidebarNavProps {
  groups: NavGroup[];
  currentPath: string;
  isCollapsed: boolean;
  onNavigate?: (id: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  groups,
  currentPath,
  isCollapsed,
  onNavigate,
}) => {
  const [activeItem, setActiveItem] = useState(currentPath);
  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({
    courses: true, // Default open for course creation & management workflow
  });

  const handleItemClick = (item: NavItem) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);

    if (hasChildren && !isCollapsed) {
      setExpandedSubmenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      setActiveItem(item.id);
      if (onNavigate) onNavigate(item.id);
    }
  };

  const handleSubItemClick = (subItemId: string) => {
    setActiveItem(subItemId);
    if (onNavigate) onNavigate(subItemId);
  };

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 sidebar-custom-scrollbar">
      {groups.map((group) => (
        <div key={group.id} className="space-y-1">
          {!isCollapsed && group.title && (
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
              {group.title}
            </p>
          )}

          {group.items.map((item) => {
            const isActive = activeItem === item.id || activeItem.startsWith(`${item.id}-`);
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isExpanded = Boolean(expandedSubmenus[item.id]);

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => handleItemClick(item)}
                  title={isCollapsed ? item.label : undefined}
                  className={`relative w-full flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Left Active Glow Indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-sm shadow-indigo-500/50" />
                  )}

                  {/* Icon */}
                  <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>

                  {/* Label & Badges */}
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      <div className="flex items-center gap-1.5 ml-2">
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              item.badgeColor === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : item.badgeColor === 'amber'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {hasChildren && (
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-500 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </button>

                {/* Submenu Accordion */}
                {!isCollapsed && hasChildren && isExpanded && (
                  <div className="ml-7 pl-3 border-l border-slate-800 space-y-1 pt-1">
                    {item.children?.map((subItem) => {
                      const isSubActive = activeItem === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.id)}
                          className={`w-full text-left h-8 px-2.5 rounded-md text-xs font-medium transition-colors truncate ${
                            isSubActive
                              ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
};