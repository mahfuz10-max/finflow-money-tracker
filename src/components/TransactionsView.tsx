import { useMemo, useState } from 'react';
import { Plus, Trash2, Receipt, Search, ChevronDown } from '@/lib/icons';
import { formatCurrency, formatDate } from '@/lib/format';
import { getCategoryIcon } from '@/lib/icons';
import type { Transaction, Category, TransactionType } from '@/types';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  onAdd: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | TransactionType;

export function TransactionsView({
  transactions,
  categories,
  onAdd,
  onEdit,
  onDelete,
}: TransactionsViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter !== 'all' && tx.type !== filter) return false;
      if (categoryFilter !== 'all' && tx.category_id !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const catName = tx.category_id ? categoryMap.get(tx.category_id)?.name?.toLowerCase() || '' : '';
        if (!tx.description.toLowerCase().includes(q) && !catName.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filter, categoryFilter, search, categoryMap]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const filterPills: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expenses' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink-900">Transactions</h1>
          <p className="mt-1 text-sm font-medium text-ink-400">Manage all your income and expenses</p>
        </div>
        <button
          onClick={onAdd}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-glow-lg hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" strokeWidth={2.5} />
          Add Transaction
        </button>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-ink-200/50 bg-white px-4 py-3 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Income</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-primary-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl border border-ink-200/50 bg-white px-4 py-3 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Expenses</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-rose-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rounded-2xl border border-ink-200/50 bg-white px-4 py-3 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Net</p>
          <p className={`mt-1 text-lg font-bold tabular-nums ${totalIncome - totalExpense >= 0 ? 'text-ink-900' : 'text-rose-600'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-ink-200/50 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-ink-50/50 p-1">
          {filterPills.map((p) => (
            <button
              key={p.value}
              onClick={() => setFilter(p.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filter === p.value
                  ? 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-200/50'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-xl border border-ink-200 bg-ink-50/50 py-2.5 pl-4 pr-9 text-sm font-medium text-ink-900 outline-none transition-all focus:border-primary-400 focus:bg-white"
          >
            <option value="all">All Categories</option>
            {filter !== 'income' && (
              <optgroup label="Expenses">
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            )}
            {filter !== 'expense' && (
              <optgroup label="Income">
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-ink-200/50 bg-white shadow-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-300">
            <Receipt className="mb-3 h-12 w-12 opacity-40" />
            <p className="text-sm font-medium">
              {transactions.length === 0 ? 'No transactions yet. Add your first one!' : 'No transactions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {filtered.map((tx) => {
              const cat = tx.category_id ? categoryMap.get(tx.category_id) : null;
              const Icon = getCategoryIcon(cat?.icon || 'Circle');
              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-ink-50/50"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: `${cat?.color || '#94a3b8'}14` }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.1} style={{ color: cat?.color || '#94a3b8' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{tx.description}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: tx.type === 'income' ? 'rgb(16 185 129 / 0.1)' : 'rgb(244 63 94 / 0.1)',
                            color: tx.type === 'income' ? '#059669' : '#e11d48',
                          }}
                        >
                          {tx.type}
                        </span>
                        <span className="text-xs font-medium text-ink-400">
                          {cat?.name || 'Uncategorized'} · {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-primary-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '−'}{formatCurrency(Number(tx.amount))}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        onClick={() => onEdit(tx)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-ink-500 transition-colors hover:bg-ink-200/50 hover:text-ink-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="rounded-lg p-1.5 text-ink-300 transition-all hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
