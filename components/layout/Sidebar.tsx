'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Receipt,
  Bell,
  CreditCard,
  Settings,
  Wallet,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionKey } from '@/types/SectionKey';

interface SidebarProps {
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const sectionRoutes: Record<SectionKey, string> = {
  dashboard: '/',
  analytics: '/Analytics',
  'expense-list': '/expense-list',
  'bill-reminders': '/bill-reminders',
  subscriptions: '/Subscriptions',
  settings: '/Settings',
};

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'expense-list', label: 'Expense List', icon: Receipt },
  { id: 'bill-reminders', label: 'Bill Reminders', icon: Bell },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeSection,
  setActiveSection,
  isOpen,
  onToggle,
}: SidebarProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-50 h-screen w-72 lg:w-80 bg-background/95 backdrop-blur-xl border-r border-border shadow-xl transition-transform duration-300',
        isMobile && !isOpen && '-translate-x-full',
        isMobile && isOpen && 'translate-x-0',
        !isMobile && 'translate-x-0'
      )}
    >
      {/* Sidebar Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pt-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                ExpenseTracker
              </h1>
              <p className="text-sm text-muted-foreground">Manage your finances</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveSection(id as SectionKey);
                  router.push(sectionRoutes[id as SectionKey]);
                  if (isMobile) onToggle();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <ChevronRight className="ml-auto w-4 h-4 text-white opacity-70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border text-sm text-muted-foreground text-center">
          <p>Ravi</p>
        </div>
      </div>
    </aside>
  );
}
