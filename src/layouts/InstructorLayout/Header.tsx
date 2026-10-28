import React, { useState } from 'react';

export interface HeaderProps {
  onOpenMobileSidebar: () => void;
  pageTitle?: string;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  pageTitle = 'Instructor Workspace',
  unreadNotificationsCount = 3,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left Area: Mobile Menu Toggle & Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs text-slate-500 hidden sm:inline">Portal</span>
          <span className="text-xs text-slate-600 hidden sm:inline">/</span>
          <h1 className="text-sm md:text-base font-semibold text-slate-100 truncate tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Center Area: Quick Search & Command Trigger (⌘K) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div
          className={`relative w-full flex items-center transition-all ${
            isSearchFocused ? 'ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10' : ''
          } bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5`}
        >
          <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses, students, tasks..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 rounded border border-slate-700">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right Area: Actions, Notifications & Quick Create */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Quick Action Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Course</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
          )}
        </button>
      </div>
    </header>
  );
};