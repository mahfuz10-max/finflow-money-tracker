import { useState, useEffect } from 'react';
import { X, Check } from '@/lib/icons';
import { getCategoryIcon } from '@/lib/icons';
import { formatMonth, getMonthStart } from '@/lib/format';
import type { Category, Budget } from '@/types';

interface BudgetModalProps {
  open: boolean;
  categories: Category[];
  existingBudgets: Budget[];
  onClose: () => void;
  onSubmit: (data: { category_id: string; amount: number; month: string }) => Promise<void>;
}

export function BudgetModal({ open, categories, existingBudgets, onClose, onSubmit }: BudgetModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(getMonthStart());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCategoryId('');
      setAmount('');
      setMonth(getMonthStart());
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const monthsList = (() => {
    const now = new Date();
    const dates: { value: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      dates.push({ value: getMonthStart(d), label: formatMonth(d) });
    }
    return dates;
  })();

  const isCategoryBudgeted = (catId: string) => {
    return existingBudgets.some((b) => b.category_id === catId && b.month === month);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Select a category');
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ category_id: categoryId, amount: amt, month });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up sm:rounded-3xl animate-scale-in">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink-900">Add Budget</h2>
            <p className="text-xs font-medium text-ink-400">Set a monthly spending limit</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600">
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Month */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-semibold text-ink-900 outline-none transition-all focus:border-primary-400 focus:bg-white"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const selected = categoryId === cat.id;
                const budgeted = isCategoryBudgeted(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                      selected
                        ? 'border-primary-400 bg-primary-50/50 ring-2 ring-primary-100'
                        : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    {budgeted && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-white" title="Already budgeted this month" />
                    )}
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${cat.color}14` }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} style={{ color: cat.color }} />
                    </div>
                    <span className="text-[11px] font-semibold text-ink-700">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-ink-300">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full rounded-2xl border border-ink-200 bg-ink-50/50 py-4 pl-10 pr-4 text-2xl font-bold tabular-nums text-ink-900 placeholder-ink-300 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-glow-lg disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} /> {saving ? 'Saving...' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
