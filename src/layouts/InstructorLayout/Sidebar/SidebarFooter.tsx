import React from 'react';
import  type{ InstructorUser } from './types';

interface SidebarFooterProps {
  instructor: InstructorUser;
  isCollapsed: boolean;
  onLogout?: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  instructor,
  isCollapsed,
  onLogout,
}) => {
  return (
    <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
      <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="relative flex-shrink-0">
          <img
            src={instructor.avatarUrl}
            alt={instructor.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{instructor.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{instructor.role}</p>
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={onLogout}
            aria-label="Log Out"
            title="Log Out"
            className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors rounded-md hover:bg-slate-800 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};