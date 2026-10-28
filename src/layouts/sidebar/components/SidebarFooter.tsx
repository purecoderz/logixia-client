import  { useState } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface FooterProps {
  isCollapsed: boolean
}

export const SidebarFooter = ({ isCollapsed }: FooterProps) => {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);


  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name[0]
  };


  return (
    <div className="p-3 border-t border-[#30363d] bg-[#0d1117]/50 shrink-0">
      {!profile ? (
        <button
          type="button"
          onClick={() => {
            navigate("/login")
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl font-mono text-xs font-bold transition-all shadow-sm active:scale-[0.98] ${isCollapsed ? 'px-0' : ''
            }`}
        >
          <span>🔑</span>
          {!isCollapsed && <span>Sign In / Register</span>}
        </button>
      ) : (
        <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#30363d] border border-[#484f58] flex items-center justify-center text-xs font-mono font-bold text-white shrink-0">
              {getInitials(profile.username)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate min-w-0">
                <span className="text-xs font-semibold text-white font-mono truncate">
                  {profile.username}
                </span>
                <span className="text-[10px] text-[#3fb950] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                  Student Pass Active
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={()=>{
              setIsLogoutModalOpen(true)
            }}
            title="Log Out"
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-rose-400 hover:bg-[#21262d] transition-colors shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      )}


      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Sign Out of Logixia?"
        message="You will lose access to your active live session until you log back in."
        confirmText="Yes, Sign Out"
        variant="danger"
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutModalOpen(false);
        }}
      />
    </div>
  );
};