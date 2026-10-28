import React from 'react';

interface SidebarHeaderProps {
  academyName: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  academyName,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <div className="relative p-4 flex items-center gap-3 border-b border-slate-800/80 min-h-[73px]">
      {/* Academy Logo Mark */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex-shrink-0">
        A
      </div>

      {!isCollapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-slate-100 text-sm truncate tracking-tight">
            {academyName}
          </span>
          <span className="text-[11px] text-indigo-400 font-medium truncate">
            Instructor Portal
          </span>
        </div>
      )}

      {/* Collapse Toggle Switch */}
      <button
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-full p-1.5 shadow-md transition-transform duration-200"
        style={{ transform: isCollapsed ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};