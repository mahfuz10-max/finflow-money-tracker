import { useState, useEffect } from 'react';
import { X, Check, TrendingUp, TrendingDown } from '@/lib/icons';
import { getCategoryIcon } from '@/lib/icons';
import type { Category, Transaction, TransactionType } from '@/types';

interface TransactionModalProps {
  open: boolean;
  categories: Category[];
  editing: Transaction | null;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category_id: string | null;
    description: string;
    date: string;
  }) => Promise<void>;
}

export function TransactionModal({ open, categories, editing, onClose, onSubmit }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setAmount(String(editing.amount));
        setCategoryId(editing.category_id || '');
        setDescription(editing.description);
        setDate(editing.date);
      } else {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      setError('');
    }
  }, [open, editing]);

  if (!open) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }
    if (!description.trim()) {
      setError('Enter a description');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        type,
        amount: amt,
        category_id: categoryId || null,
        description: description.trim(),
        date,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
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
            <h2 className="text-lg font-bold tracking-tight text-ink-900">
              {editing ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p className="text-xs font-medium text-ink-400">Track your income or expense</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600">
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-ink-100/70 p-1.5">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                type === 'expense' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100' : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              <TrendingDown className="h-4 w-4" strokeWidth={2.3} /> Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                type === 'income' ? 'bg-white text-primary-600 shadow-sm ring-1 ring-primary-100' : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              <TrendingUp className="h-4 w-4" strokeWidth={2.3} /> Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Amount</label>
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

          {/* Category */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const selected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                      selected
                        ? 'border-primary-400 bg-primary-50/50 ring-2 ring-primary-100'
                        : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
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

          {/* Description */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Description</label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping at Whole Foods"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-medium text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-medium text-ink-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
            />
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
              <Check className="h-4 w-4" strokeWidth={2.5} /> {saving ? 'Saving...' : editing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
