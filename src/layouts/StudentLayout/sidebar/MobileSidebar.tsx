import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GUEST_NAV_SECTIONS, STUDENT_NAV_SECTIONS } from '../navConfig';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarSection } from './components/SidebarSection';
import { SidebarFooter } from './components/SidebarFooter';
import { useAuth } from '../../../features/auth/context/AuthContext';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const { profile, isLoading } = useAuth();
  const { pathname } = useLocation();

  // Close when the route changes (i.e. a nav link was tapped)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape key + lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const navSections = profile ? STUDENT_NAV_SECTIONS : GUEST_NAV_SECTIONS;

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-[#30363d] bg-[#161b22] text-[#c9d1d9] shadow-2xl transition-transform duration-300 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {isLoading ? (
          <p className="p-4 text-sm text-[#8b949e]">Loading...</p>
        ) : (
          <>
            {/* The « button doubles as the close button */}
            <SidebarHeader
              isCollapsed={false}
              onBrandClick={onClose}
            />

            <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-4">
              {navSections.map((section, idx) => (
                <SidebarSection key={idx} section={section} isCollapsed={false} />
              ))}
            </div>

            <div className="pb-[env(safe-area-inset-bottom)]">
              <SidebarFooter isCollapsed={false} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
};