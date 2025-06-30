"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import LoginPage from "@/app/login/page";
import { SectionKey } from "@/types/SectionKey";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loggedIn === null) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  if (!loggedIn) {
    return <LoginPage />;
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && (
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col ml-0 lg:ml-80">
        {!isAuthPage && <Header onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
