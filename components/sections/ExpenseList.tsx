'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

import {
  Utensils, Plus, Car, Film, Book, ShoppingBag,
  Receipt, HeartPulse, DollarSign, HelpCircle,
  Trash2, Filter, Search, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { motion } from 'framer-motion';

type Expense = {
  id: number;
  purpose: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'expense' | 'income';
  user_id?: string;  // Add this
};

const categories = [
  'Food', 'Transport', 'Entertainment', 'Education',
  'Shopping', 'Bills', 'Healthcare', 'Income',
];

function getCategoryIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    Food: <Utensils className="w-6 h-6" />,
    Transport: <Car className="w-6 h-6" />,
    Entertainment: <Film className="w-6 h-6" />,
    Education: <Book className="w-6 h-6" />,
    Shopping: <ShoppingBag className="w-6 h-6" />,
    Bills: <Receipt className="w-6 h-6" />,
    Healthcare: <HeartPulse className="w-6 h-6" />,
    Income: <DollarSign className="w-6 h-6" />,
  };

  return icons[category] || <HelpCircle className="w-6 h-6" />;
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Food: 'bg-pink-100 text-pink-600',
    Transport: 'bg-yellow-100 text-yellow-700',
    Entertainment: 'bg-purple-100 text-purple-600',
    Education: 'bg-blue-100 text-blue-600',
    Shopping: 'bg-orange-100 text-orange-600',
    Bills: 'bg-indigo-100 text-indigo-600',
    Healthcare: 'bg-rose-100 text-rose-600',
    Income: 'bg-green-100 text-green-600',
  };
  return colors[category] || 'bg-gray-100 text-gray-600';
}

export default function ExpenseList() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    purpose: '', amount: 0, category: '', date: '', description: '', type: 'expense'
  });

  const {
    data: expenses = [],
    isLoading, isError, error, isFetching
  } = useQuery({
    queryKey: ['expenses', page, searchTerm, selectedCategory],
    queryFn: async (): Promise<Expense[]> => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (searchTerm) query = query.ilike('purpose', `%${searchTerm}%`);
      if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);

      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
    placeholderData: (prev) => prev,
  });

  const addMutation = useMutation({
    mutationFn: async (expense: Partial<Expense>) => {
      const { data, error } = await supabase.from('expenses').insert([expense]).select();
      if (error) throw error;
      return data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsAddModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

const handleAddExpense = async () => {
  if (newExpense.purpose && newExpense.amount && newExpense.category && newExpense.date) {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return;
    }

    addMutation.mutate({
      ...newExpense,
      amount: parseFloat(String(newExpense.amount)),
      user_id: user.id  // 👈 Add user_id here
    });

    setNewExpense({ purpose: '', amount: 0, category: '', date: '', description: '', type: 'expense' });
  }
};


  return (
    <div className="space-y-8">
      {/* Header & Add Dialog */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Expense List</h1>
          <p className="text-muted-foreground mt-1">Track your expenses and income</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 w-4 h-4" />Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Purpose</Label>
              <Input value={newExpense.purpose} onChange={(e) => setNewExpense({ ...newExpense, purpose: e.target.value })} />
              <Label>Amount</Label>
              <Input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })} />
              <Label>Category</Label>
              <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label>Type</Label>
              <Select value={newExpense.type} onValueChange={(v) => setNewExpense({ ...newExpense, type: v as 'expense' | 'income' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <Label>Date</Label>
              <Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
              <Label>Description</Label>
              <Textarea rows={3} value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
              <Button onClick={handleAddExpense} disabled={addMutation.status === 'pending'}>
                {addMutation.status === 'pending' ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input className="pl-10" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1); }}>
          <SelectTrigger className="w-48"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Filter category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <p>Loading expenses...</p>
      ) : isError ? (
        <p className="text-red-500">Error: {(error as Error).message}</p>
      ) : (
        <Card className="border">
          
          <CardContent className="space-y-2 mt-4">
            {expenses.map((expense) => {
              const categoryIcon = getCategoryIcon(expense.category);
              return (
                <motion.div
                  key={expense.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex justify-between items-center border rounded-lg px-4 py-3 transition-all group"
                >
                  {/* Purpose */}
                  <div className="flex items-center gap-2 w-1/4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                      {categoryIcon}
                    </div>
                    <div className="ml-2 text-sm     font-medium">{expense.purpose}</div>
                  </div>

                  {/* Category */}
                  <div className="w-1/5">
                    <span className={`px-2.5 py-2 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </div>

                  {/* Date */}
<div className="text-sm text-muted-foreground w-1/5 hidden md:block">{expense.date}</div>


                  {/* Amount */}
                  <div className={`text-sm font-bold w-1/5 ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {expense.type === 'income' ? <ArrowUpRight className="inline-block w-4 h-4 mr-1" /> : <ArrowDownRight className="inline-block w-4 h-4 mr-1" />}
                    ${parseFloat(String(expense.amount)).toFixed(2)}
                  </div>

                  {/* Delete */}
                  <div className="w-[30px] text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(expense.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex justify-between">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
      {isFetching && <p className="text-sm text-muted-foreground">Updating...</p>}
    </div>
  );
}
