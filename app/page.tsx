'use client';
import { useQuery } from '@tanstack/react-query';
import Dashboard from '@/components/sections/Dashboard';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const { data: expenses = [], isLoading, isError } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading expenses</div>;

  return <Dashboard expenses={expenses} />;
}
