'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import type { SectionKey } from '@/types/SectionKey';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');

  useEffect(() => {
    const cleanPath = pathname === '/' ? 'dashboard' : pathname.slice(1).toLowerCase();
    setActiveSection(cleanPath as SectionKey);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
