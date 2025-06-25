'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Plus, CreditCard, DollarSign, Calendar, Zap, X } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';

const fetchSubscriptions = async () => {
  const { data, error } = await supabase.from('subscriptions').select('*').order('next_billing'); 
  if (error) throw new Error(error.message);
  return data;
};
type Subscription = {
  id?: number;
  name: string;
  amount: number;
  renewalDate: string; // or `Date` depending on your schema
  category: string;
};
const addSubscription = async (subscription: Subscription): Promise<void> => {
  const { error } = await supabase.from('subscriptions').insert(subscription);
  if (error) throw new Error(error.message);
};
const updateSubscription = async ({ id, status }: { id: number; status: string }) => {
  const { error } = await supabase.from('subscriptions').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
};

const deleteSubscription = async (id: number) => {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw new Error(error.message);
};  

export default function Subscriptions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    name: '', amount: '', billing: 'monthly', next_billing: '', category: '', status: 'active'
  });
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions
  });

  const mutation = useMutation({
    mutationFn: addSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setNewSubscription({ name: '', amount: '', billing: 'monthly', next_billing: '', category: '', status: 'active' });
      setIsAddModalOpen(false);
    }
  });

  const toggleStatus = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
  });

  const removeSub = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
  });

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + (sub.billing === 'monthly' ? sub.amount : sub.amount / 12), 0);
  const totalYearly = totalMonthly * 12;

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
            Subscriptions
          </h1>
          <p className="text-gray-600 mt-2">Manage all your recurring subscriptions and services.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subName">Service Name</Label>
                <Input
                  id="subName"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  placeholder="e.g., Netflix"
                />
              </div>
              <div>
                <Label htmlFor="subAmount">Amount</Label>
                <Input
                  id="subAmount"
                  type="number"
                  value={newSubscription.amount}
                  onChange={(e) => setNewSubscription({ ...newSubscription, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="billing">Billing Cycle</Label>
                <Select value={newSubscription.billing} onValueChange={(value) => setNewSubscription({ ...newSubscription, billing: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nextBilling">Next Billing Date</Label>
                <Input
                  id="nextBilling"
                  type="date"
                  value={newSubscription.next_billing}
                  onChange={(e) => setNewSubscription({ ...newSubscription, next_billing: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newSubscription.category}
                  onChange={(e) => setNewSubscription({ ...newSubscription, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newSubscription.status} onValueChange={(value) => setNewSubscription({ ...newSubscription, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
  onClick={() =>
    mutation.mutate({
      ...newSubscription,
      amount: parseFloat(newSubscription.amount),
      renewalDate: newSubscription.next_billing, // use an appropriate date
    })
  }
>
  Add Subscription
</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">${totalMonthly.toFixed(2)}</p>
                  <p className="text-sm opacity-90">{activeSubscriptions.length} active</p>
                </div>
                <DollarSign className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Yearly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">${totalYearly.toFixed(2)}</p>
                  <p className="text-sm opacity-90">Annual projection</p>
                </div>
                <Calendar className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
                  <p className="text-sm opacity-90">of {subscriptions.length} total</p>
                </div>
                <Zap className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscriptions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Your Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                        {subscription.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
                        <p className="text-sm text-gray-500">{subscription.category}</p>
                      </div>
                    </div>
                    <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {subscription.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cost</span>
                      <span className="font-bold text-gray-900">
                        ${subscription.amount.toFixed(2)}/{subscription.billing === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next billing</span>
                      <span className="text-sm text-gray-900">{subscription.nextBilling}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={subscription.status === 'active'}
                          onCheckedChange={() => toggleStatus.mutate({ id: subscription.id, status: subscription.status === 'active' ? 'paused' : 'active' })}
                        />
                        <span className="text-sm text-gray-600">
                          {subscription.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSub.mutate(subscription.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}