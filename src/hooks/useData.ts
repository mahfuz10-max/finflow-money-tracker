import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category, Transaction, Budget, SavingsGoal, SavingsContribution, TransactionType } from '@/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) {
      console.error('Error loading categories:', error);
      return;
    }
    setCategories(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addCategory = useCallback(async (cat: Omit<Category, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('categories').insert(cat).select().single();
    if (error) throw error;
    await fetch();
    return data;
  }, [fetch]);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  return { categories, loading, addCategory, deleteCategory, refetch: fetch };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }
    setTransactions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addTransaction = useCallback(async (tx: {
    type: TransactionType;
    amount: number;
    category_id: string | null;
    description: string;
    date: string;
  }) => {
    const { data, error } = await supabase.from('transactions').insert(tx).select().single();
    if (error) throw error;
    await fetch();
    return data;
  }, [fetch]);

  const updateTransaction = useCallback(async (id: string, tx: Partial<Transaction>) => {
    const { error } = await supabase.from('transactions').update(tx).eq('id', id);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetch,
  };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('month', { ascending: false });
    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }
    setBudgets(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addBudget = useCallback(async (budget: {
    category_id: string;
    amount: number;
    month: string;
  }) => {
    // Upsert: if a budget for this category+month already exists, update it
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('category_id', budget.category_id)
      .eq('month', budget.month)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount: budget.amount })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('budgets').insert(budget);
      if (error) throw error;
    }
    await fetch();
  }, [fetch]);

  const deleteBudget = useCallback(async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  return { budgets, loading, addBudget, deleteBudget, refetch: fetch };
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const [goalsRes, contribRes] = await Promise.all([
      supabase.from('savings_goals').select('*').order('created_at', { ascending: false }),
      supabase.from('savings_contributions').select('*').order('created_at', { ascending: false }),
    ]);
    if (goalsRes.error) console.error('Error loading savings goals:', goalsRes.error);
    if (contribRes.error) console.error('Error loading contributions:', contribRes.error);
    setGoals(goalsRes.data || []);
    setContributions(contribRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addGoal = useCallback(async (goal: {
    name: string;
    target_amount: number;
    color: string;
    icon: string;
    deadline: string | null;
  }) => {
    const { error } = await supabase.from('savings_goals').insert(goal);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  const addContribution = useCallback(async (contrib: {
    goal_id: string;
    amount: number;
    note: string | null;
  }) => {
    const { error } = await supabase.from('savings_contributions').insert(contrib);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  const deleteContribution = useCallback(async (id: string) => {
    const { error } = await supabase.from('savings_contributions').delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }, [fetch]);

  return {
    goals,
    contributions,
    loading,
    addGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
    refetch: fetch,
  };
}
