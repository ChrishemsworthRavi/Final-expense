'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import type { SectionKey } from '@/types/SectionKey';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // false by default for mobile

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex">
        {/* Sidebar - visible always on lg+ */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex flex-col flex-1 lg:ml-80 min-h-screen">
          <Header onToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
