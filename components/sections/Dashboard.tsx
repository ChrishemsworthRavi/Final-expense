'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Expense {
  id: number;
  purpose: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface Props {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: Props) {
  const last10 = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const dailySpend =
    totalExpense / new Set(expenses.map((e) => e.date)).size || 0;

  const budgetLimit = totalIncome || 5000; // fallback budget if income missing
  const budgetUsed = Math.min((totalExpense / budgetLimit) * 100, 100);
  const remainingBudget = Math.max(budgetLimit - totalExpense, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Expense */}
        <StatCard
          title="Monthly Expense"
          amount={`$${totalExpense.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8 opacity-80" />}
          trendLabel="+12% from last month"
          trendIcon={<ArrowUpRight className="w-4 h-4" />}
          color="from-blue-500 to-blue-600"
        />

        {/* Budget Used */}
        <StatCard
          title="Budget Used"
          amount={`${budgetUsed.toFixed(1)}%`}
          icon={
            <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
              <span className="text-sm font-bold">{budgetUsed.toFixed(1)}%</span>
            </div>
          }
          trendLabel="On track"
          trendIcon={<TrendingUp className="w-4 h-4" />}
          color="from-emerald-500 to-emerald-600"
        />

        {/* Remaining Budget */}
        <StatCard
          title="Remaining Budget"
          amount={`$${remainingBudget.toFixed(2)}`}
          icon={<TrendingDown className="w-8 h-8 opacity-80" />}
          trendLabel={`${(100 - budgetUsed).toFixed(1)}% remaining`}
          trendIcon={<ArrowDownRight className="w-4 h-4" />}
          color="from-orange-500 to-orange-600"
        />

        {/* Avg Daily Spend */}
        <StatCard
          title="Average Daily Spend"
          amount={`$${dailySpend.toFixed(2)}`}
          icon={<Calendar className="w-8 h-8 opacity-80" />}
          trendLabel="Last 30 days"
          trendIcon={<Calendar className="w-4 h-4" />}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Last 10 Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Transactions</CardTitle>
            <p className="text-gray-600">Your last 10 expenses and income</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {last10.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        expense.type === 'income'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {expense.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.purpose}</h3>
                      <p className="text-sm text-gray-500">
                        {expense.category} • {expense.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        expense.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                    </p>
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

function StatCard({
  title,
  amount,
  icon,
  trendLabel,
  trendIcon,
  color,
}: {
  title: string;
  amount: string;
  icon: React.ReactNode;
  trendLabel: string;
  trendIcon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`relative overflow-hidden border-0 bg-gradient-to-br ${color} text-white shadow-xl hover:shadow-2xl transition-all duration-300`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium opacity-90">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{amount}</p>
              <div className="flex items-center gap-1 mt-2">
                {trendIcon}
                <span className="text-sm opacity-90">{trendLabel}</span>
              </div>
            </div>
            {icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
