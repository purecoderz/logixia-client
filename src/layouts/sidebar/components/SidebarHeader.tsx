import React from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onBrandClick: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onBrandClick,
}) => {
  const { profile } = useAuth();

  return (
    <div
      className={`flex h-16 shrink-0 items-center border-b border-[#30363d] ${
        isCollapsed ? "justify-center px-2" : "px-4"
      }`}
    >
      <div
        onClick={onBrandClick}
        className="flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden"
      >
        <img
          src="/logixialogo.webp"
          alt="Logixia Academy"
          className="h-9 w-9 shrink-0 rounded-xl border border-[#30363d] bg-[#0d1117] object-cover"
        />
        {!isCollapsed && (
          <div className="flex flex-col truncate">
            <span className="font-mono text-sm font-bold leading-none tracking-tight text-white">
              Logixia <span className="text-[#58a6ff]">Academy</span>
            </span>
            <span className="mt-1 font-mono text-[10px] text-[#8b949e]">
              {profile ? "Student Portal" : "Guest Mode"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};