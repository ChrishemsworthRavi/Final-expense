'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Plus, Bell, Calendar, DollarSign, Clock, AlertCircle
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Bill = {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  frequency: string;
  status: string;
  daysLeft: number;
};

const fetchBills = async (): Promise<Bill[]> => {
  const { data, error } = await supabase.from('bills').select('*');
  if (error) throw error;

  return data.map((bill: any) => ({
    ...bill,
    daysLeft: Math.ceil((new Date(bill.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  }));
};

export default function BillReminders() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'Monthly',
  });

  const queryClient = useQueryClient();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: fetchBills,
  });

 const addBillMutation = useMutation({
  mutationFn: async () => {
    const daysLeft = Math.ceil(
      (new Date(newBill.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const status = daysLeft < 0 ? 'overdue' : daysLeft <= 7 ? 'due-soon' : 'upcoming';

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user found');
    }

    const { error } = await supabase.from('bills').insert([
      {
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        due_date: newBill.dueDate,
        frequency: newBill.frequency,
        status,
        user_id: user.id, // 👈 include user_id to satisfy RLS
      },
    ]);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    setNewBill({ name: '', amount: '', dueDate: '', frequency: 'Monthly' });
    setIsAddModalOpen(false);
  },
});


  const deleteBill = async (id: number) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (!error) queryClient.invalidateQueries({ queryKey: ['bills'] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'due-soon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const totalUpcoming = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = bills.filter((bill) => bill.status === 'overdue').length;
  const dueSoonBills = bills.filter((bill) => bill.status === 'due-soon').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Bill Reminders
          </h1>
          <p className="text-gray-600 mt-2">Stay on top of your monthly payments and never miss a due date.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Add Bill Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Bill Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="billName">Bill Name</Label>
                <Input
                  id="billName"
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="billAmount">Amount</Label>
                <Input
                  id="billAmount"
                  type="number"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newBill.frequency} onValueChange={(value) => setNewBill({ ...newBill, frequency: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => addBillMutation.mutate()} className="w-full">
                Add Bill Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Upcoming Bills', value: `$${totalUpcoming.toFixed(2)}`, desc: `${bills.length} bills`, icon: <DollarSign /> },
          { title: 'Due Soon', value: dueSoonBills, desc: 'Within 7 days', icon: <Clock /> },
          { title: 'Overdue Bills', value: overdueBills, desc: 'Need attention', icon: <AlertCircle /> }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
          >
            <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{item.value}</p>
                  <p className="text-sm opacity-90">{item.desc}</p>
                </div>
                <div className="w-8 h-8 opacity-80">{item.icon}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bills List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Your Bill Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              bills.map((bill, index) => (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      bill.status === 'overdue'
                        ? 'bg-red-100 text-red-600'
                        : bill.status === 'due-soon'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {bill.status === 'overdue' ? <AlertCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status === 'overdue' ? 'Overdue' : bill.status === 'due-soon' ? 'Due Soon' : 'Upcoming'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 ">
                        Due: {bill.due_date} • {bill.frequency} •{' '}
                        {bill.daysLeft > 0
                          ? `${bill.daysLeft} days left`
                          : bill.daysLeft === 0
                          ? 'Due today'
                          : `${Math.abs(bill.daysLeft)} days overdue`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${bill.amount.toFixed(2)}</p>
                    <Button size="sm" className="mt-2" onClick={() => deleteBill(bill.id)}>
                      Mark as Paid
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
