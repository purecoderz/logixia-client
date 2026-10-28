import React, { useState } from 'react';
import { Sidebar } from './Sidebar/Sidebar';
import { Header } from './Header';

export interface InstructorLayoutProps {
  children?: React.ReactNode;
  currentPath?: string;
  pageTitle?: string;
  onNavigate?: (id: string) => void;
  onLogout?: () => void;
}

export const InstructorLayout: React.FC<InstructorLayoutProps> = ({
  children,
  currentPath = 'dashboard',
  pageTitle = 'Instructor Dashboard',
  onNavigate,
  onLogout
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleNavigation = (id: string) => {
    setMobileSidebarOpen(false); // Auto close mobile drawer on navigation
    if (onNavigate) onNavigate(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans antialiased">
      {/* 1. Desktop Fixed Sidebar */}
      <div className="hidden lg:block flex-shrink-0 z-40">
        <Sidebar
          currentPath={currentPath}
          collapsed={desktopCollapsed}
          onToggleCollapse={setDesktopCollapsed}
          onNavigate={handleNavigation}
          onLogout={onLogout}
        />
      </div>

      {/* 2. Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 3. Mobile Sliding Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out transform ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentPath={currentPath}
          collapsed={false} // Always full width on mobile drawer
          onNavigate={handleNavigation}
          onLogout={onLogout}
        />
      </div>

      {/* 4. Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <Header
          pageTitle={pageTitle}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Content Slot */}
        <main
          role="main"
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 main-content-scrollbar"
        >
          <div className="max-w-7xl mx-auto">
            {children }
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;