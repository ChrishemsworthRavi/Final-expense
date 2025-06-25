'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

import {
  Plus, Search, Filter, Trash2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

// Define your Expense type
type Expense = {
  id: number;
  purpose: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'expense' | 'income';
};

const categories = ['Food', 'Transport', 'Entertainment', 'Education', 'Shopping', 'Bills', 'Healthcare', 'Income'];

export default function ExpenseList() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    purpose: '',
    amount: 0,
    category: '',
    date: '',
    description: '',
    type: 'expense'
  });

const {
  data: expenses = [],
  isLoading,
  isError,
  error,
  isFetching,
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

  const handleAddExpense = () => {
    if (
      newExpense.purpose && newExpense.amount &&
      newExpense.category && newExpense.date
    ) {
      addMutation.mutate({
        ...newExpense,
        amount: parseFloat(String(newExpense.amount))
      });

      setNewExpense({
        purpose: '', amount: 0, category: '',
        date: '', description: '', type: 'expense'
      });
    }
  };

  const { status } = addMutation;

  return (
    <div className="space-y-8">
      {/* Header & Add Dialog */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
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
              <div>
                <Label>Purpose</Label>
                <Input value={newExpense.purpose} onChange={(e) => setNewExpense({ ...newExpense, purpose: e.target.value })} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newExpense.type} onValueChange={(v) => setNewExpense({ ...newExpense, type: v as 'expense' | 'income' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
              </div>
              <Button onClick={handleAddExpense} disabled={status === 'pending'}>
                {status === 'pending' ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={selectedCategory} onValueChange={(v) => {
          setSelectedCategory(v);
          setPage(1);
        }}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter category" />
          </SelectTrigger>
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
          <CardHeader>
            <CardTitle>Transactions ({expenses.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.map((expense) => (
              <motion.div key={expense.id} className="flex justify-between items-center border rounded-lg p-4">
                <div className="flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${expense.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {expense.type === 'income' ? <ArrowUpRight /> : <ArrowDownRight />}
                  </div>
                  <div>
                    <p className="font-semibold">{expense.purpose}</p>
                    <p className="text-xs text-muted-foreground">{expense.category} • {expense.date}</p>
                    {expense.description && <p className="text-xs text-gray-400 mt-1">{expense.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-lg font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {expense.type === 'income' ? '+' : '-'}${parseFloat(String(expense.amount)).toFixed(2)}
                  </p>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(expense.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
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
