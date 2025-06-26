'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, AlertTriangle, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Expense = {
  id: number;
  purpose: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
};

const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase.from('expenses').select('*');
  if (error) throw new Error(error.message);
  console.log('[Analytics] Fetched expenses:', data);
  return data || [];
};

const getMonthlyStats = (expenses: Expense[]) => {
  const monthlyMap: Record<string, { income: number; expense: number }> = {};

  expenses.forEach((item) => {
    const month = item.date.slice(0, 7); // e.g., "2025-06"
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }
    if (item.type === 'income') {
      monthlyMap[month].income += item.amount;
    } else {
      monthlyMap[month].expense += item.amount;
    }
  });

  return Object.entries(monthlyMap).map(([month, { income, expense }]) => ({
    month,
    income,
    expense,
  }));
};

const getCategoryBreakdown = (expenses: Expense[]) => {
  const map = new Map<string, number>();

  expenses.forEach((item) => {
    if (item.type === 'expense') {
      map.set(item.category, (map.get(item.category) || 0) + item.amount);
    }
  });

  return Array.from(map.entries()).map(([category, total]) => ({
    name: category,
    value: total,
  }));
};

const fetchInsights = async (expenses: Expense[]) => {
  console.log('[Analytics] Sending expenses to API:', expenses);

  const response = await fetch('/api/getInsights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expenses }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }

  const insights = await response.json();
  console.log('[Analytics] Received insights:', insights);
  return insights;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
  });

  const monthlyData = getMonthlyStats(expenses);
  const categoryData = getCategoryBreakdown(expenses).map((item, i) => ({
    ...item,
    color: COLORS[i % COLORS.length],
  }));

  const {
    data: insights = [],
    isLoading: loadingInsights,
  } = useQuery({
    queryKey: ['insights', expenses],
    queryFn: () => fetchInsights(expenses),
    enabled: expenses.length > 0,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Detailed insights into your spending patterns and financial habits.
        </p>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="expense" fill="#EF4444" />
                  <Bar dataKey="income" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              AI-Powered Insights
            </CardTitle>
            <p className="text-gray-600">
              Smart recommendations to optimize your spending
            </p>
          </CardHeader>
          <CardContent>
            {loadingInsights ? (
              <p className="text-sm text-gray-500">Loading insights...</p>
            ) : !Array.isArray(insights) ? (
              <p className="text-sm text-red-500">Failed to generate insights.</p>
            ) : (
              <div className="space-y-4">
                {insights.map((insight: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className={`p-6 rounded-xl border-l-4 ${
                      insight.type === 'warning'
                        ? 'bg-red-50 border-red-400'
                        : insight.type === 'opportunity'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-green-50 border-green-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {insight.type === 'warning' && (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          {insight.type === 'opportunity' && (
                            <Target className="w-5 h-5 text-yellow-600" />
                          )}
                          {insight.type === 'positive' && (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          )}
                          <h3
                            className={`font-semibold ${
                              insight.type === 'warning'
                                ? 'text-red-800'
                                : insight.type === 'opportunity'
                                ? 'text-yellow-800'
                                : 'text-green-800'
                            }`}
                          >
                            {insight.title}
                          </h3>
                        </div>
                        <p className="text-gray-700 mb-2">{insight.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span
                            className={`font-medium ${
                              insight.impact === 'High'
                                ? 'text-red-600'
                                : insight.impact === 'Medium'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            Impact: {insight.impact}
                          </span>
                          <span className="text-gray-600">
                            Potential Savings: {insight.savings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
