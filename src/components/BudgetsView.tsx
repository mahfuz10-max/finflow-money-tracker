import { useMemo, useState } from 'react';
import { Target, Plus, Trash2, ChevronLeft, ChevronRight } from '@/lib/icons';
import { formatCurrency, formatMonth, getMonthStart, getMonthEnd } from '@/lib/format';
import { getCategoryIcon } from '@/lib/icons';
import type { Transaction, Category, Budget } from '@/types';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function BudgetsView({ budgets, categories, transactions, onAdd, onDelete }: BudgetsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthStart());

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const monthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  const monthSpending = useMemo(() => {
    const start = selectedMonth;
    const end = getMonthEnd(new Date(selectedMonth));
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense' && t.category_id && t.date >= start && t.date <= end)
      .forEach((t) => {
        const current = map.get(t.category_id!) || 0;
        map.set(t.category_id!, current + Number(t.amount));
      });
    return map;
  }, [transactions, selectedMonth]);

  const totalBudget = monthBudgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (monthSpending.get(b.category_id) || 0), 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const monthsList = useMemo(() => {
    const now = new Date();
    const dates: { value: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      dates.push({ value: getMonthStart(d), label: formatMonth(d) });
    }
    return dates;
  }, []);

  const prevMonth = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(getMonthStart(d));
  };
  const nextMonth = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(getMonthStart(d));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink-900">Budgets</h1>
          <p className="mt-1 text-sm font-medium text-ink-400">Set monthly spending limits per category</p>
        </div>
        <button
          onClick={onAdd}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-glow-lg hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" strokeWidth={2.5} />
          Add Budget
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-ink-200/50 bg-white p-3 shadow-card">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-ink-100 hover:text-ink-700"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="cursor-pointer rounded-lg border-0 bg-transparent px-4 py-2 text-center text-sm font-bold text-ink-900 outline-none"
        >
          {monthsList.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <button
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-ink-100 hover:text-ink-700"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>

      {/* Summary with progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-6 shadow-xl shadow-ink-900/20">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-accent-500/10 blur-2xl" />
        <div className="relative grid grid-cols-3 gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Total Budget</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Total Spent</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-rose-400">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Remaining</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${totalBudget - totalSpent >= 0 ? 'text-primary-400' : 'text-rose-400'}`}>
              {formatCurrency(totalBudget - totalSpent)}
            </p>
          </div>
        </div>
        {totalBudget > 0 && (
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-ink-400">
              <span>Overall Progress</span>
              <span className={overallPct > 100 ? 'text-rose-400' : 'text-primary-400'}>{overallPct.toFixed(0)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallPct > 100 ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                  overallPct > 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-primary-500 to-accent-400'
                }`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Budget Cards */}
      {monthBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200/50 bg-white py-16 text-ink-300 shadow-card">
          <Target className="mb-3 h-12 w-12 opacity-40" />
          <p className="text-sm font-medium">No budgets set for {formatMonth(new Date(selectedMonth))}. Add one to start tracking!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monthBudgets.map((budget) => {
            const cat = categoryMap.get(budget.category_id);
            const Icon = getCategoryIcon(cat?.icon || 'Circle');
            const spent = monthSpending.get(budget.category_id) || 0;
            const pct = Number(budget.amount) > 0 ? Math.min((spent / Number(budget.amount)) * 100, 100) : 0;
            const isOver = spent > Number(budget.amount);
            const barColor = isOver
              ? 'from-rose-500 to-rose-400'
              : pct > 80
              ? 'from-amber-500 to-amber-400'
              : 'from-primary-500 to-accent-400';
            const statusLabel = isOver ? 'Over budget' : pct > 80 ? 'Almost there' : 'On track';
            const statusColor = isOver ? 'text-rose-600 bg-rose-50' : pct > 80 ? 'text-amber-600 bg-amber-50' : 'text-primary-600 bg-primary-50';

            return (
              <div
                key={budget.id}
                className="group relative overflow-hidden rounded-2xl border border-ink-200/50 bg-white p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-ink-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${cat?.color || '#94a3b8'}14` }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.1} style={{ color: cat?.color || '#94a3b8' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-900">{cat?.name || 'Unknown'}</p>
                      <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(budget.id)}
                    className="rounded-lg p-1.5 text-ink-300 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold tracking-tight text-ink-900">{formatCurrency(spent)}</span>
                    <span className="text-sm font-medium text-ink-400">of {formatCurrency(Number(budget.amount))}</span>
                  </div>

                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isOver ? 'text-rose-600' : 'text-ink-500'}`}>
                      {isOver
                        ? `${formatCurrency(spent - Number(budget.amount))} over`
                        : `${formatCurrency(Number(budget.amount) - spent)} left`}
                    </span>
                    <span className={`font-bold tabular-nums ${isOver ? 'text-rose-600' : pct > 80 ? 'text-amber-600' : 'text-primary-600'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
