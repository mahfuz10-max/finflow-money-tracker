import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet2, Receipt, ArrowUpRight, ArrowDownRight, Plus } from '@/lib/icons';
import { formatCurrency, formatDate, getMonthStart, getMonthEnd } from '@/lib/format';
import { getCategoryIcon } from '@/lib/icons';
import { IncomeExpenseBarChart, SpendingDonutChart } from '@/components/Charts';
import type { Transaction, Category, Budget } from '@/types';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  onAddTransaction: () => void;
}

export function Dashboard({ transactions, categories, onAddTransaction }: DashboardProps) {
  const stats = useMemo(() => {
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    const monthTx = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
    const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

    return { monthIncome, monthExpense, balance, monthTxCount: monthTx.length, savingsRate };
  }, [transactions]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const spendingByCategory = useMemo(() => {
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();
    const map = new Map<string, number>();

    transactions
      .filter((t) => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd && t.category_id)
      .forEach((t) => {
        const current = map.get(t.category_id!) || 0;
        map.set(t.category_id!, current + Number(t.amount));
      });

    const arr = Array.from(map.entries())
      .map(([catId, value]) => ({
        label: categoryMap.get(catId)?.name || 'Unknown',
        value,
        color: categoryMap.get(catId)?.color || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return arr;
  }, [transactions, categoryMap]);

  const totalSpending = spendingByCategory.reduce((s, d) => s + d.value, 0);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.created_at.localeCompare(a.created_at))
      .slice(0, 6);
  }, [transactions]);

  const heroCard = {
    label: 'Total Balance',
    value: stats.balance,
  };

  const statCards = [
    {
      label: 'Income',
      sublabel: 'This month',
      value: formatCurrency(stats.monthIncome),
      icon: TrendingUp,
      iconBg: 'bg-primary-500',
      iconLight: 'bg-primary-50 text-primary-600',
      valueColor: 'text-primary-700',
      trend: '+',
      trendIcon: ArrowUpRight,
    },
    {
      label: 'Expenses',
      sublabel: 'This month',
      value: formatCurrency(stats.monthExpense),
      icon: TrendingDown,
      iconBg: 'bg-rose-500',
      iconLight: 'bg-rose-50 text-rose-600',
      valueColor: 'text-rose-700',
      trend: '−',
      trendIcon: ArrowDownRight,
    },
    {
      label: 'Transactions',
      sublabel: 'This month',
      value: String(stats.monthTxCount),
      icon: Receipt,
      iconBg: 'bg-blue-500',
      iconLight: 'bg-blue-50 text-blue-600',
      valueColor: 'text-blue-700',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero + Stat Cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Hero balance card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-6 shadow-xl shadow-ink-900/20 xl:col-span-1">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-accent-500/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                <Wallet2 className="h-3.5 w-3.5 text-primary-400" strokeWidth={2.3} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{heroCard.label}</p>
            </div>
            <p className={`mt-4 text-[32px] font-bold tracking-tight ${stats.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(stats.balance)}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 ring-1 ring-white/10">
                <span className={`flex h-1.5 w-1.5 rounded-full ${stats.savingsRate >= 0 ? 'bg-primary-400' : 'bg-rose-400'}`} />
                <span className="text-[11px] font-semibold text-ink-300">
                  {stats.savingsRate >= 0 ? `${stats.savingsRate.toFixed(0)}% saved` : `${Math.abs(stats.savingsRate).toFixed(0)}% deficit`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendIcon;
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-3xl border border-ink-200/50 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-ink-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-500">{card.label}</p>
                  <p className="text-[11px] font-medium text-ink-300">{card.sublabel}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconLight} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" strokeWidth={2.1} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                {TrendIcon && (
                  <TrendIcon className={`h-4 w-4 ${card.valueColor === 'text-primary-700' ? 'text-primary-500' : 'text-rose-500'}`} strokeWidth={2.5} />
                )}
                <p className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-ink-200/50 bg-white p-6 shadow-card lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink-900">Income vs Expenses</h2>
              <p className="text-xs font-medium text-ink-400">Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-primary-700">
                <span className="h-2 w-2 rounded-full bg-primary-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expenses
              </span>
            </div>
          </div>
          <IncomeExpenseBarChart transactions={transactions} months={6} />
        </div>

        <div className="rounded-3xl border border-ink-200/50 bg-white p-6 shadow-card">
          <div className="mb-2">
            <h2 className="text-base font-bold tracking-tight text-ink-900">Spending</h2>
            <p className="text-xs font-medium text-ink-400">By category this month</p>
          </div>
          {totalSpending > 0 ? (
            <>
              <SpendingDonutChart data={spendingByCategory} total={totalSpending} />
              <div className="mt-4 space-y-2.5">
                {spendingByCategory.slice(0, 4).map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/5" style={{ backgroundColor: d.color }} />
                      <span className="font-medium">{d.label}</span>
                    </span>
                    <span className="font-bold text-ink-900">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-ink-300">
              <Receipt className="mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No expenses this month yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-3xl border border-ink-200/50 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-ink-900">Recent Transactions</h2>
            <p className="text-xs font-medium text-ink-400">Your latest activity</p>
          </div>
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 rounded-xl bg-ink-900 px-3.5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-ink-800 hover:shadow-lg hover:shadow-ink-900/20"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Add
          </button>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-ink-300">
            <Receipt className="mb-3 h-12 w-12 opacity-40" />
            <p className="text-sm font-medium">No transactions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {recentTransactions.map((tx) => {
              const cat = tx.category_id ? categoryMap.get(tx.category_id) : null;
              const Icon = getCategoryIcon(cat?.icon || 'Circle');
              return (
                <div key={tx.id} className="group flex items-center justify-between py-3.5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: `${cat?.color || '#94a3b8'}14` }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.1} style={{ color: cat?.color || '#94a3b8' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{tx.description}</p>
                      <p className="text-xs font-medium text-ink-400">
                        {cat?.name || 'Uncategorized'} · {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-primary-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '−'}{formatCurrency(Number(tx.amount))}
                    </span>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${tx.type === 'income' ? 'bg-primary-50' : 'bg-rose-50'}`}>
                      {tx.type === 'income'
                        ? <ArrowUpRight className="h-3.5 w-3.5 text-primary-600" strokeWidth={2.5} />
                        : <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" strokeWidth={2.5} />}
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
