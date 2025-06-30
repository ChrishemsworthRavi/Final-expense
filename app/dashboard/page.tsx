"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import Dashboard from "@/components/sections/Dashboard";

export default function DashboardPage() {
  const {
    data: expenses = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-8 text-gray-500">Loading your dashboard...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500">Error loading expenses: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  return (
    <div className="p-8">
      <Dashboard expenses={expenses} />
    </div>
  );
}
