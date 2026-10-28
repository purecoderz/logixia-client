import type { ReactNode } from 'react';

export interface NavSubItem {
  id: string;
  label: string;
  href?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: string | number;
  badgeColor?: 'indigo' | 'emerald' | 'amber' | 'rose';
  children?: NavSubItem[];
}

export interface NavGroup {
  id: string;
  title?: string;
  items: NavItem[];
}

export interface InstructorUser {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  academy: string;
}

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (id: string) => void;
  instructor?: InstructorUser;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  onLogout?: () => void;
}