'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/sections/Dashboard';
import Analytics from '@/components/sections/Analytics';
import ExpenseList from '@/components/sections/ExpenseList';
import BillReminders from '@/components/sections/BillReminders';
import Subscriptions from '@/components/sections/Subscriptions';
import Settings from '@/components/sections/Settings';
import type { SectionKey } from '@/types/SectionKey';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch expenses using React Query
  const { data: expenses = [], isLoading, isError } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      return data;
    },
  });

  const sections: Record<SectionKey, JSX.Element> = {
    dashboard: <Dashboard expenses={expenses} />,
    analytics: <Analytics />,
    'expense-list': <ExpenseList />,
    'bill-reminders': <BillReminders />,
    subscriptions: <Subscriptions />,
    settings: <Settings />,
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 dark:from-background dark:via-muted/10 dark:to-muted/20">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col">
        <Header sidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {isLoading ? (
                  <div className="text-center text-gray-500">Loading dashboard...</div>
                ) : isError ? (
                  <div className="text-center text-red-500">Error loading expenses.</div>
                ) : (
                  sections[activeSection]
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
